
function onLocationUpdate(ws, wss, payload) {
    wss.clients.forEach(function each(client) {
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

const actionTypes = {
    names: {
        LOCATION_UPDATE: 'locationUpdate'
    },
    handlers: {
        onLocationUpdate,
    }
}


module.exports = exports = actionTypes;