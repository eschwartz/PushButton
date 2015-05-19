var PushButton = require('./lib/PushButton');
var Logger = require('./lib/util/Logger');
var context;

Logger.handleLog(function(message) {
  console.log('LOG:' + message);
}, Logger.TRACE);

var pb = new PushButton();

pb.run().
  then(updateApiUrl).
  done(quit, fail);

function updateApiUrl() {
  return pb.getContext()
    // Wait for EbEnv to launch
    .then(function(ctx) {
      context = ctx;

      return context.
        resources['turbine-engine-eb-env'].
        waitUntilReady();
    }).
    // Grab the SQS Queue
    then(function(ebEnv) {
      return ebEnv.getQueue();
    }).
    // Update the SQS Queue policy
    tap(function(sqsQueue) {
      return sqsQueue.addPermission({
        principals: [context.params.sqsIamId],
        actions: ['*']
      });
    }).
    // Grab the Queue URL
    then(function(sqsQueue) {
      return sqsQueue.getQueueUrl();
    }).
    // Add the SQS_URL env var
    then(function(queueUrl) {
      return context.
        resources['turbine-engine-eb-env'].
        updateEnvironmentVars({
          SQS_URL: queueUrl
        });
    });
}

function quit() {
  console.log('Deployment successful');
  process.exit(0);
}

function fail(err) {
  console.error(err.stack);
  process.exit(1);
}
