// require("dotenv").config();

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_BUCKET = process.env.AWS_BUCKET;

const up = require("./upload");
const down = require("./download");

const awsUpload = (user, repo) => {
  up.uploadFiles(user, repo);
};

const awsDownload = (user, repo) => {
  down.downloadFiles(user, repo);
};

module.exports = {
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  AWS_BUCKET,
  awsUpload,
  awsDownload,
};
