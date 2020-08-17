const express = require("express");
const axios = require("axios");
const fs = require("fs");
const hasha = require("hasha");

const docsify = require("./docsify");

// Compares local and remote readme for changes
function isDiffReadme(user, repo, readmeData) {
  if (fs.existsSync(`./docs/${user}-${repo}/README.md`)) {
    const localReadmeHash = hasha.fromFileSync(
      `./docs/${user}-${repo}/README.md`,
      { algorithm: "md5" }
    );
    const remoteReadmeHash = hasha(readmeData, { algorithm: "md5" });

    if (localReadmeHash == remoteReadmeHash) {
      return false;
    }
  }
  return true;
}

// Writes all the required files
function writeDocs(user, repo, readmeData) {
  const htmlData = docsify.generateHTML(user, repo);

  fs.writeFileSync(`./docs/${user}-${repo}/README.md`, readmeData, function (
    err
  ) {
    if (err) throw err;
    console.log("Generated ReadMe!");
  });

  fs.writeFileSync(`./docs/${user}-${repo}/index.html`, htmlData, function (
    err
  ) {
    if (err) throw err;
    console.log("Generated HTML!");
  });
}

// Gets readme contents and generates /docs/<files> with docsify enabled to render
async function getReadme(user, repo) {
  const readme = await axios.get(
    `https://api.github.com/repos/${user}/${repo}/readme`
  );
  const readmeUrl = readme.data.download_url;
  const readmeData = await axios.get(readmeUrl);

  if (!fs.existsSync("./docs/")) {
    fs.mkdirSync("./docs/");
  }

  if (!fs.existsSync(`./docs/${user}-${repo}/`)) {
    fs.mkdirSync(`./docs/${user}-${repo}/`);
  }

  // Write file only if github readme is different from local copy
  if (isDiffReadme(user, repo, readmeData.data)) {
    writeDocs(user, repo, readmeData.data);
  }
}

// Serves the compiled docs
function serveDocs(app, user, repo) {
  app.use(`/${user}/${repo}`, express.static(`./docs/${user}-${repo}`));
}

module.exports = { getReadme, serveDocs };
