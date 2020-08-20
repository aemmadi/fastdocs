const AWS = require("aws-sdk");
const fs = require("fs");

const { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_BUCKET } = require("./aws");

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
});

const uploadFiles = (user, repo) => {
  const path = `${user}-${repo}`;

  const indexFile = {
    content: fs.readFileSync(`./_docs/${path}/index.html`),
    name: "index.html",
  };

  const readmeFile = {
    content: fs.readFileSync(`./_docs/${path}/README.md`),
    name: "README.md",
  };

  pushToS3(path, indexFile);
  pushToS3(path, readmeFile);
};

const pushToS3 = (path, file) => {
  const params = {
    Bucket: AWS_BUCKET,
    Key: `${path}/${file.name}`,
    Body: file.content,
  };

  s3.upload(params, (err, data) => {
    if (err) throw err;
    console.log(`Successfully uploaded ${file.name} to AWS!`);
  });
};

module.exports = { uploadFiles };
