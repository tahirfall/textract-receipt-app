const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
 app.use(
    '/prod',
    createProxyMiddleware({
      target: 'https://2wt6m4eyg2.execute-api.us-east-1.amazonaws.com',
      changeOrigin: true,
      pathRewrite: {
        '^/prod': '/prod', // rewrite path
      },
    })
 );
};
