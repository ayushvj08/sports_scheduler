const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.get("/", (request, response) => {
  response.render("index", { title: "HomePage" });
});
app.listen(3000, () => {
  console.group("Server started at port: 3000");
});
