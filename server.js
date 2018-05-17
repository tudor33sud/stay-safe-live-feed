const express = require('express');
const http = require('http');
const url = require('url');
const websocket = require('ws');
const jwt = require('jsonwebtoken');
const KeyCloakCerts = require('get-keycloak-public-key');
const keyCloakCerts = new KeyCloakCerts('http://localhost:8080', 'StaySafe');
const dataService = require('./service/stay-safe-data');
const app = express();
const userRoles = require('./utils/user-roles');
const { LOCATION_UPDATE } = require('./utils/actionTypes').names;
const handlers = require('./utils/actionTypes').handlers;
app.get('/', async (req, res) => {
    res.send('merge si http');
});

const server = http.createServer(app);
const wss = new websocket.Server({
    server,
    verifyClient: async (info, done) => {
        try {
            const { eventId, auth, location } = url.parse(info.req.url, true).query;
            if (!auth) {
                return done(false, 401, 'Unauthorized');
            }
            const decoded = jwt.decode(auth, { complete: true });
            const kid = decoded.header.kid;
            const publicKey = await keyCloakCerts.fetch(kid);
            if (publicKey) {
                jwt.verify(auth, publicKey, { algorithms: ['RS256'] }, async function (err, decoded) {
                    if (err) {
                        done(false, 401, 'Unauthorized')
                    } else {
                        try {
                            if (!eventId) {
                                throw new Error('Cannot connect to live feed without the event');
                            }
                            const event = await dataService.getEventById(eventId, '123', auth);
                            const apiRoles = decoded.resource_access['stay-safe-api'];
                            if (apiRoles) {
                                if (apiRoles.roles.includes(userRoles.AMBULANCE)) {
                                    info.req.isAmbulance = true;
                                }
                            }
                            info.req.user = decoded;
                            info.req.eventId = eventId;
                            info.req.jwt = auth;
                            done(true)
                        } catch (err) {
                            done(false, 401, 'Unauthorized');
                        }

                    }
                });
            } else {
                done(false, 401, 'Unauthorized');
            }
        } catch (err) {
            done(false, 401, 'Unauthorized');
        }

    }
});

wss.on('connection', async (ws, req) => {
    try {
        ws.user = req.user;
        ws.eventId = req.eventId;
        if (req.isAmbulance) {
            ws.isAmbulance = true;
        }

        ws.on('message', message => {
            console.log(`received ${message} from ${ws.user.email}`);
            const parsed = JSON.parse(message);
            if (parsed.action === LOCATION_UPDATE) {
                handlers.onLocationUpdate(ws, wss, parsed.value);
            }
        });

        ws.on('close', () => {
            console.log(`${ws.user.email} disconnected`);
        });
        ws.send(`Hi ${ws.user.email} you are connected to ws server`);
    } catch (err) {
        console.log(err);
        ws.close();
    }

});

server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address().port}`);
});



