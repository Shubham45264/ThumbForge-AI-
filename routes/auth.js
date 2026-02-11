const authController = require("../controllers/authController.js");

module.exports = async function (fastify, options) {

  fastify.post("/register", authController.register);
  fastify.post("/login", authController.login);
  fastify.post("/forgot-password", authController.forgotpassword);
  fastify.post("/reset-password/:token", authController.resetpassword);
  fastify.post(
    "/logout",
    { preHandler: [fastify.authenticate] },
    authController.logout
  );
};
