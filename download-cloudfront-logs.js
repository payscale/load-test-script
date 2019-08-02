const AWS = require('aws-sdk');
const fs = require('fs');
const zlib = require('zlib');
const args = require('yargs').argv;
 
/** Args:
 * timestamp (required): In the format YYYY-mm-dd-hh. This is the hour of logs you will download.
 * bucketName (required): the bucket that holds the cloudfront logs
 * s3folder (required): the folder within the bucket that holds the cloudfront logs
 * cloudfrontId (required): used for the file prefix
 */
var s3 = new AWS.S3();

var timestamp = args.timestamp;
var bucketName = args.bucketName;
var folderName = args.s3folder;
var cloudfrontId = args.cloudfrontId;

/** Download and unzip a file */
const downloadFile = (key) => {
  if (!key) {
    return;
  }

  var params = {
    Bucket: bucketName,
    Key: key
  };

  const fileName = `./data/${key.slice(folderName.length + cloudfrontId.length + 2, -3)}.txt`;

  const writeStream = fs.createWriteStream(fileName);
  s3.getObject(params).createReadStream().pipe(zlib.createGunzip()).pipe(writeStream);
  console.log(`${fileName} has been created!`);
}

/** Download all the blobs */
const downloadFiles = () => {
  // Make sure 'data' folder exists first
  try {
    fs.mkdirSync('./data')
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }

  s3.listObjects({
    Bucket: bucketName,
    Prefix: `${folderName}/${cloudfrontId}.${timestamp}`
  }, function (err, data) {
    if(err) throw err;
    data.Contents.forEach(file => downloadFile(file.Key))
  });
}

downloadFiles();