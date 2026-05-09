const express = require("express");
const app = express();
const port = 6999;

const db = require("./dbconfig/config");

const router = require("./router/router");

const cors = require("cors");

const dns = require("dns")
dns.setServers(["1.1.1.1","8.8.8.8"])


app.use(express.json());

app.use(cors());

/* AUTHORIZATION MIDDLEWARE */

app.use((req, res, next) => {
  const publicRoutes = ["/login", "/register"];

  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const key = req.headers?.key;

  if (key === "1234") {
    return next();
  }

  return res.status(401).json({
    status: false,
    message: "Unauthorized",
  });
});

/* ROUTES */

app.use("/", router);

/* SERVER */

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});