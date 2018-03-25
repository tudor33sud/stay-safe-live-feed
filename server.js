const express = require('express');
const http = require('http');
const url = require('url');
const websocket = require('ws');
const jwt = require('jsonwebtoken');
const KeyCloakCerts = require('get-keycloak-public-key');
const keyCloakCerts = new KeyCloakCerts('http://localhost:8080', 'StaySafe');
const dataService = require('./service/stay-safe-data');
const app = express();

const server = http.createServer(app);
const wss = new websocket.Server({
    server,
    verifyClient: async (info, done) => {
        try {
            const { eventId, auth } = url.parse(info.req.url, true).query;
            if (!auth) {
                return done(false, 401, 'Unauthorized');
            }
            const decoded = jwt.decode(auth, { complete: true });
            const kid = decoded.header.kid;
            const publicKey = await keyCloakCerts.fetch(kid);
            if (publicKey) {
                jwt.verify(auth, publicKey, { algorithms: ['RS256'] }, function (err, decoded) {
                    if (err) {
                        done(false, 401, 'Unauthorized')
                    } else {
                        info.req.user = decoded;
                        info.req.eventId = eventId;
                        info.req.jwt = auth;
                        done(true)
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
        const { eventId } = url.parse(req.url, true).query;
        const event = await dataService.getEventById(eventId, '123', req.jwt);
        console.log(event);
        ws.user = req.user;
        ws.event = event;
        ws.on('message', message => {
            console.log(`received ${message} from ${ws.user.email}`);
            ws.send(`User ${ws.user.email} sent ${message}`);
        });

        ws.on('close', () => {
            console.log('disconnected');
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