require.config({
  baseUrl: '/'
});

define(['./connection.js', './single_call.js', './subscription.js'], function(Connection, SingleCall, Subscription) {
  var connection = new Connection();
  return {
    SingleCallService: new SingleCall(connection),
    SubscriptionService: new Subscription(connection)
  }
});