angular
  .module('external', [])
  .value('AriaLib', window.AriaLib)
  .value('async', window.async)
  .value('TransportCreator', window.TransportCreator)
  .value('Notification', window.Notification)
  .value('SingleCallService', window.SingleCallService)
  .value('SubscriptionService', window.SubscriptionService)
  .value('options', window.Options);
