const axios = require("axios");
const express = require("express");
const { response } = require("express");
const fs = require("fs");

const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/:user/:repo/compile", (req, res) => {
  const user = req.params.user;
  const repo = req.params.repo;
  getReadme(user, repo);

  // Gets readme contents and generates /docs/<files> with docsify enabled to render
  async function getReadme(user, repo) {
    const readme = await axios.get(
      `https://api.github.com/repos/${user}/${repo}/readme`
    );
    const readmeUrl = readme.data.download_url;
    const readmeData = await axios.get(readmeUrl);

    fs.mkdirSync(`./${user}-${repo}/`);

    fs.writeFileSync(`./${user}-${repo}/README.md`, readmeData.data, function (
      err
    ) {
      if (err) throw err;
      console.log("Saved!");
    });

    const htmlData = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${repo}</title><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/><meta name="description" content="Description"/> <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"/> <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css"/> </head> <body> <div id="app"></div><script>window.$docsify={name: '${repo}', repo: '${user}/${repo}'}; </script> <script src="//cdn.jsdelivr.net/npm/docsify@4"></script> </body></html>`;

    fs.writeFileSync(`./${user}-${repo}/.nojekyll`, "", function (err) {
      if (err) throw err;
      console.log("Generated nojekyll");
    });

    fs.writeFileSync(`./${user}-${repo}/index.html`, htmlData, function (err) {
      if (err) throw err;
      console.log("Generated HTML!");
    });
    await serveDocs(user, repo);
    res.send(`Successfully Compiled Docs! View them at /${user}/${repo}`);
  }
});

async function serveDocs(user, repo) {
  app.use(`/${user}/${repo}`, express.static(`${user}-${repo}`));
}

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
