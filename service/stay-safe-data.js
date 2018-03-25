const appConfig = require('../config');
const rp = require('request-promise');
const dataServiceRequest = rp.defaults({
    baseUrl: appConfig.dataServiceUrl,
    json: true
});

function getEventById(eventId, requestId, jwt) {
    const options = {
        uri: `/events/${eventId}`,
        method: `GET`,
        headers: {
            [appConfig.tracingHeaderKey]: requestId,
            [appConfig.jwtHeaderKey]: jwt
        }
    };
    return dataServiceRequest(options);
}

module.exports = {
    getEventById
}