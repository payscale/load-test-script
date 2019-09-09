# Load Testing Script using Cloudfront Logs
A load testing script in NodeJS that pulls cloudfront logs and replays them.

## Getting Started
These instructions will get this script up and running on your local machine.

### Prerequisites
* node
* yarn
* You need to have the .aws/credentials file locally with the default credentials (See [this article](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) for details)

### To Run the load test
* Install packages: `yarn`
* Download an hour's worth of logs: `node .\download-cloudfront-logs.js --timestamp <YYYY-MM-DD-HH> --bucketName <cloudfrontLogsBucketName> --cloudfrontId <distribution id> --s3folder <folder where logs are kept>` 
  * NOTE: the timestamp is in UTC
* Replay the logs against the host of your choice: `node ./load-test.js --urlHost 'www.<yourHost>.com' --prefix '/<the path subset you want to test>' --maxPings 100`
  * NOTE: if you run out of memory, run node such as with 4gb:`node --max-old-space-size=4096 ...`. 

### Parameters for download-cloudfront-logs.js
| Name          | Required      | Description     | Default Value
| ------------- |:-------------:| ---------------:|----------------:|
| timestamp     | required      | A timestamp in the format of: YYYY-MM-DD-HH. This is used to grab all S3 logs with that file prefix           | - 
| bucketName    | required      | The S3 bucket that contains the Cloudfront logs | -
| cloudfrontId  | required      | The ID of the cloudfront distribution in question | -
| s3folder      | required | The folder within S3 to get logs from | -

### Parameters for load-test.js
| Name          | Required      | Description     | Default Value
| ------------- |:-------------:| ---------------:|----------------:|
| urlHost       | required      | The url host that you want to ping | -
| prefix        | optional      | A path prefix for the urls that you want to replay (if you don't want to replay all logs, but instead just a subset) | - 
| maxPings      | optional      | If you want to limit the load test to a certain number of pings | -

## Contributing
Please read CONTRIBUTING.md for contributing to the project and submitting pull requests to us. For details on our code of conduct, visit Code of Conduct.

## Authors
[dani.fenske@payscale.com](mailto:dani.fenske@payscale.com)

## License
This project is licensed under the Apache 2 License - see the LICENSE file for details
