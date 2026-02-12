"use strict";

require("dotenv").config();

const path = require("path");
const fastify = require("fastify")({ logger: true });

// --------------------
// Core plugins
// --------------------
fastify.register(require("@fastify/cors"), {
  origin: (origin, cb) => {
    // Allow localhost or any Vercel domain
    if (!origin || /localhost/.test(origin) || /\.vercel\.app$/.test(origin)) {
      cb(null, true);
      return;
    }
    cb(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
});
fastify.register(require("@fastify/sensible"));
fastify.register(require("@fastify/multipart"));
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "uploads"),
  prefix: "/uploads/",
});
// --------------------
// Custom plugins
// --------------------
fastify.register(require("./plugins/mongodb"));
fastify.register(require("./plugins/jwt"));

// --------------------
// Routes
// --------------------
fastify.register(require("./routes/auth"), {
  prefix: "/api/auth"
});
fastify.register(require("./routes/thumbnail"), {
  prefix: "/api/thumbnails"
});


// --------------------
// Base routes
// --------------------
fastify.get("/", async () => {
  return { status: "API is running 🚀" };
});

fastify.get("/test-db", async () => {
  const state = fastify.mongoose.connection.readyState;
  const map = ["disconnected", "connected", "connecting", "disconnecting"];
  return { database: map[state] };
});

// --------------------
// Start server
// --------------------
const start = async () => {
  try {
    await fastify.listen({
      port: Number(process.env.PORT) || 4000,
      host: "0.0.0.0"
    });

    fastify.log.info(
      `Server running at http://localhost:${process.env.PORT || 4000}`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
