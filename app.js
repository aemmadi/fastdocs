const express = require("express");
const axios = require("axios");
const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { response } = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/:user/:repo", (req, res) => {
  const user = req.params.user;
  const repo = req.params.repo;
  getReadme(user, repo);

  async function getReadme(user, repo) {
    const readme = await axios.get(
      `https://api.github.com/repos/${user}/${repo}/readme`
    );
    const readmeUrl = readme.data.download_url;
    const readmeData = await axios.get(readmeUrl);

    fs.writeFile(`${user}-${repo}.md`, readmeData.data, function (err) {
      if (err) throw err;
      console.log("Saved!");
    });

    const htmlData = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${repo}</title><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/><meta name="description" content="Description"/> <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"/> <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css"/> </head> <body> <div id="app"></div><script>window.$docsify={name: '${repo}', repo: '${user}/${repo}', homepage: '${user}-${repo}.md'}; </script> <script src="//cdn.jsdelivr.net/npm/docsify@4"></script> </body></html>`;

    fs.writeFile(`${user}-${repo}.html`, htmlData, function (err) {
      if (err) throw err;
      console.log("Generated HTML!");
    });

    res.send(readmeData.data);
  }
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
