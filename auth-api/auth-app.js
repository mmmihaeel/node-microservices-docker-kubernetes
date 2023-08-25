const dotenv = require('dotenv');
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const fs = require("fs");
const uuid = require("uuid");
const path = require("path");
const jwt = require("jsonwebtoken");
const app = express();
app.use(bodyParser.json());
app.use(helmet());

const JWT_SECRET = process.env.JWT_SECRET.toString() || uuid.v4();
const DATA_JSON = path.join(__dirname, process?.env?.DATA_FOLDER_TOKENS?.toString() || 'tokens.json');
const PORT = Number(process.env?.AUTH_API_PORT) || 1777;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.get('origin') || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.chunkedEncoding = true;
    return res.send({ server: "Auth" });
  }
  next();
});

app.get("/verify-token/:token/:userId", (req, res) => {
  const token = req.params.token;
  const userId = req.params.userId;
  if (
    !userId ||
    userId.trim().length === 0 ||
    !token ||
    token.trim().length === 0
  ) {
    return res
      .status(422)
      .json({ message: "Token and userId need to be specified!" });
  }

  const rawData = fs.readFileSync(DATA_JSON);
  const loadedData = JSON.parse(rawData);
  const tokenData = loadedData.find((token) => (token.userId == req.params.userId && token.token === req.params.token));
  if (!tokenData) {
    return res.status(404).json({ message: "Token not found!" });
  }

  try {
    jwt.verify(tokenData.token, JWT_SECRET);
  } catch (err) {
    loadedData.splice(
      loadedData.findIndex((token) => token.userId == userId),
      1
    );
    fs.writeFileSync(DATA_JSON, JSON.stringify(loadedData, null, 2));
    return res.status(401).json({ message: "Token expired", err: err });
  }

  if (token === tokenData.token) {
    return res
      .status(200)
      .json({ message: "Valid token.", token: tokenData.token });
  }
  return res.status(401).json({ message: "Token invalid." });
});

app.get("/:userId/token", (req, res) => {
  const hashedPassword = req.query.hashedPassword;
  const enteredPassword = req.query.enteredPassword;
  const userId = req.params.userId;
  if (
    !userId ||
    userId.trim().length === 0 ||
    !hashedPassword ||
    hashedPassword.trim().length === 0 ||
    !enteredPassword ||
    enteredPassword.trim().length === 0
  ) {
    return res
      .status(422)
      .json({ message: "Hashed and entered passwords need to be specified!" });
  }

  if (!bcrypt.compareSync(enteredPassword, hashedPassword)) {
    return res.status(401).json({ message: "Passwords do not match." });
  }

  const rawData = fs.readFileSync(DATA_JSON);
  const loadedData = JSON.parse(rawData);
  const token = jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: "10h" });
  loadedData.push({
    userId: userId,
    token: token,
  });
  fs.writeFileSync(DATA_JSON, JSON.stringify(loadedData, null, 2));

  return res.status(200).json({ message: "Token created!", token: token });
});

app.get("/hashed-password/:password", (req, res) => {
  const enteredPassword = req.params.password;
  if (!enteredPassword || enteredPassword.trim().length === 0) {
    return res.status(422).json({ message: "Password needs to be specified!" });
  }
  const hashedPassword = bcrypt.hashSync(enteredPassword, 12);
  return res.status(200).json({ hashedPassword: hashedPassword });
});

app.use((req, res) => {
  return res.status(404).json({ message: "Sorry, the page you're looking for doesn't exist." });
});

app.listen(PORT, async () => {
  console.log(`Process ${process.pid}, URL http://localhost:${PORT}, Auth API is listening on ${PORT}`);
  if (!fs.existsSync(DATA_JSON)) {
    const defaultData = JSON.stringify([], null, 2);
    fs.writeFileSync(DATA_JSON, defaultData);
    return console.log("Json data written to disk memory!");
  }
});
