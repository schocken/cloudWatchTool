// AWS SDK Variables
var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var cloudwatchlogs = new AWS.CloudWatchLogs();

// Express Variables
const express = require('express');
var app = express();
var exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); 
// app.use(express.static(__dirname + '/public'));
// Client-side Variables
// var account_name = 'vladplayground';
// var server = 'EU2-BOT1';

// These will store the logs of the session
const logGroups = [], logStreams = [], logEvents = []


// getLogGroups().then(() => console.log('logGroups', logGroups))
// .then(() => getLogStream(logGroups[0]))
// .then(() => console.log('logStreams', logStreams))
// .then(() => getEvents(logGroups[0], logStreams[0]));

app.get('/', (req, res) => {
  res.send('Hello from Express');
});

app.post('/test', (req, res) => {
  var test = req.body.test;
  res.send(JSON.stringify({test}));
})

app.post('/api/log_groups', (req, res) => {
  var server = req.body.server;
  var account_name = req.body.account;
  var nextToken = req.body.nextToken
  var resp = server + ' ' + account_name + ' ' + nextToken;
  console.log(server, account_name);
  res.setHeader('Content-Type', 'application/json');
  getLogGroups(server, account_name, nextToken)
  .then((result) => res.send(JSON.stringify({result})))
  res.send(JSON.stringify(resp));
});

app.post('/api/log_streams', (req, res) => {
  var server = req.body.server;
  var account_name = req.body.account;
  var group = req.body.group
  var nextToken = req.body.nextToken
  var prevToken = req.body.prevToken
  console.log(group);
  res.setHeader('Content-Type', 'application/json');
  getLogStream(group, nextToken, prevToken)
  .then((result) => res.send(JSON.stringify({result})))
})

app.post('/api/log_events', (req, res) => {
  var server = req.body.server;
  var account_name = req.body.account;
  var group = req.body.group;
  var stream = req.body.stream;
  var nextToken = req.body.nextToken;
  console.log(server, account_name, group, stream, nextToken);
  res.setHeader('Content-Type', 'application/json');
  getEvents(group, stream, nextToken)
  .then((result) => res.send(JSON.stringify({result})))
})

console.log('Server is running');
app.listen(process.env.PORT || 3000);

// Get all log groups on server and account
function getLogGroups(server, account_name, nextToken) {
  console.log('Fetching log groups')
  var params = { 
    logGroupNamePrefix: '/aws/lambda/' + server + '_' + account_name,
    nextToken: nextToken
  };
  return cloudwatchlogs.describeLogGroups(params)
    .promise()
    // .then(results => {
    //   // console.log(results);
    //   results.logGroups.forEach(group => {
    //     logGroups.push(group.logGroupName);
    //   })
    //   if(results.nextToken) {
    //     params.nextToken = results.nextToken;
    //     getLogGroups(server, account_name);
    //   }
    // })
    .catch(function(e) {
      console.log(e.message);
    })
}

function getLogStream(group, nextToken) {
  console.log('Fetching log streams of ' + group)
  var params = { 
    logGroupName: group,
    nextToken: nextToken
  };
  return cloudwatchlogs.describeLogStreams(params)
  .promise()
  .catch(function(e) {
    console.log(e.message);
  })
}

function getEvents(group, stream, nextToken) {
  console.log('Fetching log events');
  var params = { 
    logGroupName: group,
    logStreamName: stream,
    nextToken: nextToken
  };
  return cloudwatchlogs.getLogEvents(params)
  .promise()
  .catch(function(e) {
    console.log(e.message);
  })
}

