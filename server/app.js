const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const HOSTNAME = process.env.HOSTNAME || require('os').hostname();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ 
    message: "Hello from Simple App (Node)",
    container: HOSTNAME 
    });
});

module.exports = app;
