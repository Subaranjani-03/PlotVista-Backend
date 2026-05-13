require("dotenv").config(); //dotnev

const express = require("express");
const app = express();
const port = 6999;
const db = require("./dbconfig/config");
const router = require("./router/router");
const cors = require("cors");
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const verifyToken = require("./middleware/authMiddleware");

/* ================= CORS ================= */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "key"],
  })
);

/* ================= BODY PARSER ================= */

app.use(express.json());


/* ================= ROUTES ================= */

app.use("/", router);

/* ================= SERVER ================= */

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});