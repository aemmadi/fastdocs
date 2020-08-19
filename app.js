const express = require("express");

const util = require("./util");

const app = express();
const port = process.env.PORT || 3000;

app.use("/", express.static("docs"));

app.get("/:user/:repo/compile", (req, res) => {
  const user = req.params.user;
  const repo = req.params.repo;

  util.compileDocs(user, repo).then(() => {
    util.serveDocs(app, user, repo);
    res.send(`Successfully Compiled Docs! View them at /${user}/${repo}`);
  });
});

app.listen(port, () => console.log(`Deployed on port: ${port}`));
