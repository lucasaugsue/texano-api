const fs = require("fs");
const moment = require("moment");
const AWS = require("aws-sdk");
const awsKeys = require("../config/aws");

class FileRepository {
  constructor() {}

  async upload(ctx) {
    try {
      var s3 = new AWS.S3()
      s3.config.update({
        accessKeyId: process.env.AWS_S3_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
        region:"sa-east-1"
      })
      var bucket = process.env.AWS_S3_BUCKET
      console.log(ctx.request.files)
      const {directory = "default"} = ctx.params;
      const file = ctx.request.files[0];
      var filename = file.originalname;
      var extension = file.mimetype.split("/")[1];
      var prepareFilename = Buffer.from(filename + moment().format("YYYY-MM-DD HH:mm:ss"));
      var newFilename = `${directory}/${prepareFilename.toString("base64") + "." + extension}`;
      await new Promise((resolve, reject) => {
        var s3Key = newFilename;
        var params = {
          Bucket: bucket,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read"
        };

        s3.putObject(params,  function(err, data) {
          if (err) reject(err);
          else resolve(true);
        });
      });
      ctx.status = 201
      ctx.body = {uploadStatus: true, file: `https://s3-sa-east-1.amazonaws.com/${bucket}/${newFilename}`}
    } catch (error) {
      console.log({error});
      ctx.body = { error: error.message }
    }
  }
}

const fileRepository = new FileRepository();
Object.freeze(fileRepository);

export default fileRepository;