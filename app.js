const axios = require("axios");
const express = require("express");
const { response } = require("express");
const fs = require("fs");
const hasha = require("hasha");

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
  defaultConfig.name = repo;

  getReadme(user, repo).then(() => {
    res.send(`Successfully Compiled Docs! View them at /${user}/${repo}`);
  });
});

// Gets readme contents and generates /docs/<files> with docsify enabled to render
async function getReadme(user, repo) {
  const readme = await axios.get(
    `https://api.github.com/repos/${user}/${repo}/readme`
  );
  const gitRepo = await axios.get(
    `https://api.github.com/repos/${user}/${repo}/contents`
  );

  const config = JSON.parse(await getConfig(gitRepo.data));
  console.log(config);
  const readmeUrl = readme.data.download_url;
  const readmeData = await axios.get(readmeUrl);

  if (!fs.existsSync("./docs/")) fs.mkdirSync("./docs/");

  if (!fs.existsSync(`./docs/${user}-${repo}/`))
    fs.mkdirSync(`./docs/${user}-${repo}/`);

  // Write file only if github readme is different from local copy
  if (isDiffReadme()) {
    fs.writeFileSync(
      `./docs/${user}-${repo}/README.md`,
      readmeData.data,
      function (err) {
        if (err) throw err;
        console.log("Saved!");
      }
    );
  }

  let scriptPlugin = " ";
  if (config.plugins.length > 0) {
    config.plugins.forEach((plugin, index) => {
      if (plugin == "docsify-copy-code") {
        scriptPlugin +=
          '<script src="//cdn.jsdelivr.net/npm/docsify-copy-code"></script> ';
      }
    });
  }

  const htmlData = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${repo}</title><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/><meta name="description" content="${config.description}"/> <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"/> <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css"/> </head> <body> <div id="app"></div><script>window.$docsify={name: '${repo}', repo: '${user}/${repo}'}; </script> <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>${scriptPlugin}</body></html>`;

  fs.writeFileSync(`./docs/${user}-${repo}/.nojekyll`, "", function (err) {
    if (err) throw err;
    console.log("Generated nojekyll");
  });

  fs.writeFileSync(`./docs/${user}-${repo}/index.html`, htmlData, function (
    err
  ) {
    if (err) throw err;
    console.log("Generated HTML!");
  });

  // Expose generated static files to web
  await serveDocs(user, repo);
}

async function getConfig(gitRepo) {
  let configUrl = "";
  gitRepo.forEach((file, index) => {
    if (file.name == ".fastdocs.json") {
      configUrl = file.download_url;
    }
  });

  if (configUrl != "") {
    const config = await axios.get(configUrl);
    return config.data;
  }

  return defaultConfig;
}

async function isDiffReadme(user, repo, readmeData) {
  try {
    const localReadmeHash = hasha.fromFileSync(
      `./docs/${user}-${repo}/README.md`,
      { algorithm: "md5" }
    );
  } catch (error) {
    return false;
  }
  const remoteReadmeHash = hasha(readmeData, { algorithm: "md5" });

  if (localReadmeHash == remoteReadmeHash) return false;
  else return true;
}

// Serves the compiled docs
async function serveDocs(user, repo) {
  app.use(`/${user}/${repo}`, express.static(`./docs/${user}-${repo}`));
}

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
