const AWS = require("aws-sdk");
const fs = require("fs");

const { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_BUCKET } = require("./aws");

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
});

const downloadFiles = (user, repo) => {
  const path = `${user}-${repo}`;
  const indexFile = "index.html";
  const readmeFile = "README.md";

  pullFromS3(path, indexFile);
  pullFromS3(path, readmeFile);
};

const pullFromS3 = (path, file) => {
  const params = {
    Bucket: AWS_BUCKET,
    Key: `${path}/${file}`,
  };

  s3.headObject(params)
    .on("success", (response) => {
      s3.getObject(params, (err, data) => {
        if (err) throw err;
        writeFile(path, file, data);
      });
    })
    .on("error", (err) => {
      return "";
    })
    .send();
};

const writeFile = (path, file, data) => {
  if (!fs.existsSync("./_docs/")) {
    fs.mkdirSync("./_docs/");
  }

  if (!fs.existsSync(`./_docs/${path}/`)) {
    fs.mkdirSync(`./_docs/${path}/`);
  }

  fs.writeFileSync(`./_docs/${path}/${file}`, data.Body.toString());
  console.log(`Downloaded ${file}`);
};

module.exports = { downloadFiles };
