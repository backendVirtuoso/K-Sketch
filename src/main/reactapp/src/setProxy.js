const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://port-0-backend-m8uaask821ad767f.sel4.cloudtype.app',
            changeOrigin: true,
        })
    );
};