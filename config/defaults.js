const environment = process.env.NODE_ENV || 'localhost';
module.exports = {
    tracingHeaderKey: process.env.TRACING_HEADER_KEY || 'x-ss-request-id',
    jwtHeaderKey: process.env.JWT_HEADER_KEY || 'x-ss-jwt',
    dataServiceUrl: process.env.DATA_SERVICE_URL || `http://localhost:3007`,
    serviceName: 'stay-safe-live-feed'
};