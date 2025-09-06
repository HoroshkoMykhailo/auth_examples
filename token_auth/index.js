const jwt = require("jsonwebtoken");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const JWT_SECRET = "super_secret_key";
const SESSION_KEY = "Authorization";

app.use((req, res, next) => {
  const token = req.get(SESSION_KEY);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    req.user = null;
  }

  next();
});

app.get("/", (req, res) => {
  if (req.user) {
    return res.json({
      username: req.user.username,
      logout: "http://localhost:3000/logout",
    });
  }
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});

const users = [
  {
    login: "Login",
    password: "Password",
    username: "Username",
  },
  {
    login: "Login1",
    password: "Password1",
    username: "Username1",
  },
];

app.post("/api/login", (req, res) => {
  const { login, password } = req.body;

  const user = users.find((user) => {
    if (user.login == login && user.password == password) {
      return true;
    }
    return false;
  });

  if (user) {
    const token = jwt.sign(
      { login: user.login, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.json({ token });
  }

  res.status(401).send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
