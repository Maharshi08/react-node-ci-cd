const { createProxyMiddleware } = require("http-proxy-middleware");

const target = process.env.API_PROXY_TARGET || "http://13.233.215.134:5000";

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
