const express = require("express");

const util = require("./util");
const app = express();
const port = 3000;

let defaultConfig = {
  name: "",
  description: "Description",
  plugins: [],
  theme: "",
};

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/:user/:repo/compile", (req, res) => {
  const user = req.params.user;
  const repo = req.params.repo;

  util.getReadme(user, repo).then(() => {
    util.serveDocs(app, user, repo);
    res.send(`Successfully Compiled Docs! View them at /${user}/${repo}`);
  });
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
