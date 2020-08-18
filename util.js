const express = require("express");
const axios = require("axios");
const fs = require("fs");
const hasha = require("hasha");

const docsify = require("./docsify");
const plugins = require("./plugins");
let mainConfig = require("./config.json");

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
async function writeDocs(user, repo, readmeData) {
  const config = await getConfig(user, repo);

  if (isConfigDefault(config)) {
    writeDocsWithDefaultConfig(user, repo, readmeData);
  } else {
    // TODO: if config is not default? --> plugin integration!!!
    writeDocsWithConfig(user, repo, readmeData, config);
  }
}

async function writeDocsWithDefaultConfig(user, repo, readmeData) {
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

async function writeDocsWithConfig(user, repo, readmeData, config) {
  try {
    Object.keys(config).forEach((key) => {
      mainConfig[`${key}`] = config[key];
    });

    mainConfig.enablePlugins = false;
    if (mainConfig.plugins.length > 0) {
      mainConfig.enablePlugins = true;
    }

    if (mainConfig.enablePlugins) {
      const pluginConfig = plugins.addPlugins(mainConfig.plugins);
      mainConfig.plugins = pluginConfig;
    }

    const htmlData = docsify.generateHtmlWithConfig(mainConfig);

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
  } catch (error) {
    writeDocsWithDefaultConfig(user, repo, readmeData);
  }
}

// Gets readme contents and generates /docs/<files> with docsify enabled to render
async function getReadme(user, repo) {
  mainConfig.user = user;
  mainConfig.repo = repo;

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
    await writeDocs(user, repo, readmeData.data);
  }
}

// Serves the compiled docs
function serveDocs(app, user, repo) {
  app.use(`/${user}/${repo}`, express.static(`./docs/${user}-${repo}`));
}

function isConfigDefault(config) {
  if (config.name != "") return false;
  return true;
}

async function getConfig(user, repo) {
  const gitRepo = await axios.get(
    `https://api.github.com/repos/${user}/${repo}/contents`
  );
  const gitRepoFiles = gitRepo.data;
  let configUrl = "";

  for (let i = 0; i < gitRepoFiles.length; i++) {
    if (gitRepoFiles[i].name == ".fastdocs.json") {
      configUrl = gitRepoFiles[i].download_url;
      break;
    }
  }

  if (configUrl != "") {
    const config = await axios.get(configUrl);
    return config.data;
  }
  return mainConfig;
}

async function compileDocs(user, repo) {
  await getReadme(user, repo);
}

module.exports = { compileDocs, serveDocs };
