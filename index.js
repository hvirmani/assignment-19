const express = require("express");
const app = express();
const path = require("path");
const port = 3000;
const session = require("express-session");
const fs = require("fs");

app.use(express.static(path.join(__dirname + "public")));
app.use(express.urlencoded({ extended: true }));

let users = {};
app.use(
  session({
    secret: "abc",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  console.log("in the middleware");
  next();
});

function add(user) {
  if (!user) {
    console.log("invalid user");
    return;
  }
  if (users[user.username]) {
    console.log("already a user");
    return;
  }
  users[user.username] = user;
  console.log("user added");
}

function check(user) {
  if (users[user.username]) {
    if (users[user.username].password === user.password) {
      console.log("Logged in");
      return true;
    }
  }
  console.log("Invalid username or password");
  return false;
}

app.get("/", function (req, res) {
  if (req.session.isLogged) {
    fs.writeFileSync(
      path.join(__dirname, "/public/home/index.html"),
      "<h1>Welcome " +
        req.session.username +
        "</h1>" +
        "<h3>You can't login or sign up when you are logged in already</h3>" +
        "<a href='/sign'>Sign</a>  " +
        "<a href='/login'>login</a>  " +
        "<a href='/logout'>Logout</a>"
    );
    res.sendFile(path.join(__dirname, "/public/home/index.html"));
    return;
  }
  res.redirect("/sign");
});

app.get("/login", function (req, res) {
  if (req.session.isLogged) {
    res.redirect("/");
    return;
  }
  res.sendFile(path.join(__dirname, "/public/login/index.html"));
});

app.post("/login", function (req, res) {
  let user = req.body;
  if (check(user)) {
    req.session.isLogged = true;
    req.session.username = user.username;
    res.redirect("/");
    return;
  }
  res.redirect("/error");
});

app.get("/sign", function (req, res) {
  if (req.session.isLogged) {
    res.redirect("/");
    return;
  }
  res.sendFile(path.join(__dirname, "/public/sign/index.html"));
});

app.post("/sign", function (req, res) {
  add(req.body);
  console.log(users);
  res.redirect("/login");
});

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

app.get("/error", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/error/index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
