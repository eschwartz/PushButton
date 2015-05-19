var context;

var queuePromise = pb.getContext().
  // Get queue from Turbine Engine
  then(function(theContext) {
    context = theContext;

    return context.resources['turbine-engine-eb-env'].
      waitForQueue();
  }).
  // Update SQS policy
  then(function(sqsQueue) {
    return sqsQueue.addPermission({
      label: 'TurbineCanDoAnything_' + context.params.version,
      principals: ['arn:aws:iam::350421549183:user/turbine-sqs'],
      actions: ['SQS:*']
    });
  }).
  // Get SQS Queue Url
  then(function(sqsQueue) {
    return sqsQueue.getUrl();
  }).
  // Update SQS_URL env variable
  then(function(queueUrl) {
    return context.resources['turbine-engine-eb-env'].
      updateEnvironmentVars({
        'SQS_URL': queueUrl
      });
  });


envResources = {
  "EnvironmentResources": {
    "EnvironmentName": "turbine-engine-pb-test2",
    "AutoScalingGroups": [
      {
        "Name": "awseb-e-88zdt9rkud-stack-AWSEBAutoScalingGroup-15HLRKY8EAJA4"
      }
    ],
    "Triggers": [],
    "LoadBalancers": [],
    "Queues": [
      {
        "URL": "https://sqs.us-east-1.amazonaws.com/350421549183/pb-b-123456789098765432",
        "Name": "WorkerQueue"
      }
    ],
    "Instances": [
      {
        "Id": "i-ae6d7653"
      }
    ],
    "LaunchConfigurations": [
      {
        "Name": "awseb-e-88zdt9rkud-stack-AWSEBAutoScalingLaunchConfiguration-BD0T22A5WNM8"
      }
    ]
  }
};
