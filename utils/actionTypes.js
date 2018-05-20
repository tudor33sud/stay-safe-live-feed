
function onLocationUpdate(ws, wss, payload) {
    wss.clients.forEach(function (client) {
        //simple broadcast
        if (client !== ws && client.readyState === client.OPEN) {
            //check if clients share the same eventId
            if (client.eventId == ws.eventId) {
                const messagePayload = {
                    type: "ambLocUpdate",
                    value: payload
                };
                client.send(JSON.stringify(messagePayload));
            }
        }
    });
}

function onFinishedEvent(ws, wss, payload) {
    wss.clients.forEach(function (client) {
        //simple broadcast
        if (client !== ws && client.readyState === client.OPEN) {
            //check if clients share the same eventId
            if (client.eventId == ws.eventId) {
                const messagePayload = {
                    type: "finishedEvent",
                    value: payload
                };
                client.send(JSON.stringify(messagePayload));
            }
        }
    });
}

const actionTypes = {
    names: {
        LOCATION_UPDATE: 'locationUpdate',
        FINISHED_EVENT: 'finishedEvent'
    },
    handlers: {
        onLocationUpdate,
        onFinishedEvent
    }
}


module.exports = exports = actionTypes;