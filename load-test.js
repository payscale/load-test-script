const fs = require('fs');
const args = require('yargs').argv;
const request = require('request');
 
/** Args:
 * urlHost (required): the url host that you want to load test
 * prefix (optional): string to filter the url paths by (prefix only)
 * maxPings (optional): limit the number of pings that occur
*/

const urlHost = args.urlHost;
const pathPrefix = args.prefix || null;
const maxPings = args.maxPings || null;

/** Read in a file and save it to an array of DTOs */
const convertFileToArrayOfData = (file) => {
  console.log(`Reading ./data/${file}`);
  const fileContents = fs.readFileSync(`./data/${file}`, { encoding: 'utf8' });

  var rows = fileContents.split('\n');
  for (var i = 0; i < rows.length; i++) {
    col = rows[i].split('\t');
    rows[i] = col;
  }
  var rows = rows.slice(1); // Delete the first row - it is just '#Version: 1.0'
  var headers = rows[0][0];
  headers = headers.split('\ ') // Split the headers row by space, it isn't tab separated
  headers = headers.slice(1); // Delete the first header, it is just 'Fields'
  var dto = {}
  headers.forEach(h => {
    dto[h] = null;
  });
  
  if (pathPrefix) {
    rows = rows.filter(row => { return row[7] ? row[7].startsWith(pathPrefix) : false});
  }
  
  var arr = [];
  rows.forEach((m, i) => {
    arr[i] = JSON.parse(JSON.stringify(dto)); // clone the DTO
    Object.keys(dto).forEach((prop, j) => {
      arr[i][prop] = m[j];
    })
  })

  return arr;
}

/** Ping all the urls with the correct timeouts */
const pingUrls = (rows) => {
  if (maxPings) {
    rows = rows.slice(0, maxPings);
  }

  var i = 0;
  var numTimes = rows.length - 1;
  const doTheThing = () => {
    const timeBeforeNextPing = new Date(`1970-01-01T${rows[i+1].time}Z`).getTime() - new Date(`1970-01-01T${rows[i].time}Z`).getTime();
    ping(rows[i]['cs-uri-stem'], rows[i].time);
    
    i++;
    if (i < numTimes) {
      if (timeBeforeNextPing > 0) {
        console.log(`timeout for ${timeBeforeNextPing}ms`)
      }
      setTimeout(doTheThing, timeBeforeNextPing);
    }
  }

  doTheThing();
}

/** The ping function */
const ping = (urlStem, time) => {
  var separateReqPool = {maxSockets: 20};

  request(`${urlHost}${urlStem}`, {time: true, pool: separateReqPool}, (err, res, body) => {
    if (err) { return console.log(err); }
    console.log(res.statusCode === 200 ? '\x1b[32m%s\x1b[0m' : res.statusCode === 404 ? "\x1b[33m%s\x1b[0m" : '\x1b[31m%s\x1b[0m', `${time}: Took ${res.elapsedTime}ms; ${urlStem} returned ${res.statusCode}.`);
  });
}

/** Read all files */
const runLoadTest = () => {
  fs.readdir('./data', function (err, files) {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    }
  
    var allFilesData = [];
  
    files.forEach(file => {
      allFilesData.push(...convertFileToArrayOfData(file));
    });
  
    console.log(`Sorting ${allFilesData.length} rows by timestamp`);
    
    allFilesData = allFilesData.filter(d => typeof d.time !== 'undefined' && d.time !== null).sort((a, b) => a.time.localeCompare(b.time));
    
    pingUrls(allFilesData);
  });
}

runLoadTest();