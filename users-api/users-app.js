const dotenv = require('dotenv');
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const axios = require("axios");
const helmet = require("helmet");
const uuid = require("uuid");
const app = express();
app.use(bodyParser.json());
app.use(helmet());

const DATA_JSON = path.join(__dirname, process?.env?.DATA_FOLDER_USERS?.toString() || "users.json");
const PORT = Number(process.env?.USERS_API_PORT) || 1778;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.get('origin') || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (
    !password ||
    password.trim().length === 0 ||
    !email ||
    email.trim().length === 0
  ) {
    return res
      .status(422)
      .json({ message: "An email and password needs to be specified!" });
  }

  const rawData = fs.readFileSync(DATA_JSON);
  const loadedData = JSON.parse(rawData);

  const doesUserExist = loadedData.some((user) => user?.email === email);
  if (doesUserExist) {
    return res.status(400).json({ message: "User already exists!" });
  }

  try {
    const response = await axios.get(
      `${process?.env?.AUTH_API_URL?.toString() || 'http://localhost:1777'}/hashed-password/${password}`
    );
    const userId = uuid.v4();
    loadedData.push({
      id: userId,
      password: response.data.hashedPassword,
      email: email,
    });
    fs.writeFileSync(DATA_JSON, JSON.stringify(loadedData, null, 2));
    res.status(201).json({ message: "User created!", userId: userId });
  } catch (err) {
    return res
      .status(err?.response?.status || 500)
      .json({
        message:
          err?.response?.data?.message ||
          "Creating the user failed - please try again later.",
      });
  }
});

app.get("/user/:userId", (req, res) => {
  const userId = req.params.userId;
  if (!userId || userId.trim().length === 0) {
    return res
      .status(422)
      .json({ message: "Token and userId need to be specified!" });
  }
  const rawData = fs.readFileSync(DATA_JSON);
  const loadedData = JSON.parse(rawData);
  const user = loadedData?.find((user) => user?.id === userId);
  if (!user) {
    return res
      .status(404)
      .json({ message: "User not found!" });
  }
  return res
    .status(200)
    .json({ message: "User found!" });
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (
    !password ||
    password.trim().length === 0 ||
    !email ||
    email.trim().length === 0
  ) {
    return res
      .status(422)
      .json({ message: "An email and password needs to be specified!" });
  }
  const rawData = fs.readFileSync(DATA_JSON);
  const loadedData = JSON.parse(rawData);
  const user = loadedData?.find((user) => user?.email === email);
  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }
  const hashedPassword = user?.password;
  try {
    const response = await axios.get(
      `${process?.env?.AUTH_API_URL?.toString() || 'http://localhost:1777'}/${user?.id}/token?hashedPassword=${hashedPassword}&enteredPassword=${password}`
    );
    if (response.status === 200) {
      return res
        .status(200)
        .json({
          message: "User logged in succesfully!",
          token: response?.data?.token,
          userId: user.id,
        });
    }
  } catch (err) {
    return res
      .status(err?.response?.status)
      .json({ message: err?.response?.data?.message });
  }
});

app.use((req, res) => {
  res
    .status(404)
    .json({ message: "Sorry, the page you're looking for doesn't exist." });
});

app.listen(PORT, async () => {
  console.log(
    `Process ${process.pid}, URL http://localhost:${PORT}, Users API is listening on ${PORT}`
  );
  if (!fs.existsSync(DATA_JSON)) {
    const defaultData = JSON.stringify([], null, 2);
    fs.writeFileSync(DATA_JSON, defaultData);
    console.log("Json data written to disk memory!");
  }
});
