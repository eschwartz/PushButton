var PushButton = require('../lib/PushButton');


var pb = new PushButton().run().
  then(updateApiUrl).
  done(quit, fail);

function updateApiUrl() {
  return pb.getContext()
    .then(function(ctx) {

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
