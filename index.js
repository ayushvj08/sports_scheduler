const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");

app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json());
app.set("view engine", "ejs");

app.get("/", (request, response) => {
  response.render("index", { title: "HomePage" });
});

app.get("/login", (request, response) => {
  response.render("login", { title: "Login" });
});

app.get("/signup", (request, response) => {
  response.render("signup", { title: "Signup" });
});

app.listen(3000, () => {
  console.group("Server started at port: 3000");
});
