const dotenv = require('dotenv');
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });
const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const helmet = require("helmet");
app.use(bodyParser.json());
app.use(helmet());

const TASKS_FOLDER = path.join(
  __dirname,
  process?.env?.TASKS_FOLDER || "tasks"
);
const PORT = Number(process.env?.TASKS_API_PORT) || 1779;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.get('origin') || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.chunkedEncoding = true;
    return res.send({ server: "Tasks" });
  }
  next();
});

const extractAndVerifyToken = async (headers, userId) => {
  if (!headers.authorization) {
    throw new Error("No token provided.");
  }
  const token = headers.authorization.split(" ")[1];
  try {
    const response = await axios.get(
      `${process?.env?.AUTH_API_URL?.toString() || 'http://localhost:1777'}/verify-token/${token}/${userId}`
    );
    return response.data.token;
  } catch (err) {
    throw err;
  }
};

app.get("/:userId/tasks", async (req, res) => {
  try {
    const userId = req.params.userId;
    const token = await extractAndVerifyToken(req.headers, userId);
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

    fs.readdir(TASKS_FOLDER, (err, files) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Could not read tasks. Try again later!" });
      }

      const txtFiles = files.find((file) => file === `task-${userId}.txt`);
      if (!txtFiles) {
        return res
          .status(200)
          .json({ message: "You did not created tasks yet!", tasks: [] });
      }
    });

    fs.readFile(path.join(TASKS_FOLDER, `task-${userId}.txt`), (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Loading the tasks failed.", error: err.message });
      }
      const strData = data.toString();
      const entries = strData.split("TASK_SPLIT");
      entries.pop();
      const tasks = entries.map((json) => JSON.parse(json));
      res.status(200).json({ message: "Tasks loaded!", tasks: tasks });
    });
  } catch (err) {
    return res
      .status(err?.response?.status || 401)
      .json({
        message:
          err?.response?.data?.message ||
          err.message ||
          "Failed to load tasks.",
      });
  }
});

app.post("/:userId/tasks", async (req, res) => {
  try {
    const userId = req.params.userId;
    const token = await extractAndVerifyToken(req.headers, userId);
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

    fs.readdir(TASKS_FOLDER, (err, files) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Could not read tasks. Try again later!" });
      }

      const txtFiles = files.find((file) => file === `task-${userId}.txt`);
      if (!txtFiles) {
        fs.writeFileSync(path.join(TASKS_FOLDER, `task-${userId}.txt`), '');
      }
    });

    const text = req.body?.text?.toString();
    const title = req.body?.title?.toString();

    if (
      !text ||
      text.trim().length === 0 ||
      !title ||
      title.trim().length === 0
    ) {
      return res
        .status(422)
        .json({ message: "Text and title need to be specified!" });
    }

    const task = { title, text };
    const jsonTask = JSON.stringify(task);
    fs.appendFile(
      path.join(TASKS_FOLDER, `task-${userId}.txt`),
      jsonTask + "TASK_SPLIT",
      (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Storing the task failed." });
        }
        res.status(201).json({ message: "Task stored!", createdTask: task });
      }
    );
  } catch (err) {
    console.log(err);
    return res
      .status(err?.response?.status || 500)
      .json({
        message:
          err?.response?.data?.message ||
          err.message ||
          "Failed to add task. Try again later...",
      });
  }
});

app.use((req, res) => {
  res
    .status(404)
    .json({ message: "Sorry, the page you're looking for doesn't exist." });
});

app.listen(PORT, async () => {
  console.log(
    `Process ${process.pid}, URL http://localhost:${PORT}, Tasks API is listening on ${PORT}`
  );
  fs.stat(TASKS_FOLDER, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        fs.mkdir(TASKS_FOLDER, (err) => {
          if (err) {
            console.error("Error creating directory:", err);
            return;
          }
          console.log("Directory created successfully.");
        });
      } else {
        console.error("Error checking directory:", err);
      }
    } else {
      if (stats.isDirectory()) {
        console.log("Directory exists.");
      } else {
        console.log("Path exists, but it is not a directory.");
      }
    }
  });
});
