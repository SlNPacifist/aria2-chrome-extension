angular
  .module('DownloadAsApp', ['external'])
  .controller('DownloadAsController', ['$scope', 'SingleCallService', 'Notification',
  function ($scope, SingleCallService, Notification) {
    chrome.runtime.getBackgroundPage(function setName(background) {
      $scope.$apply(function() {
        $scope.url = background.getDownloadedUrl();
      });
    });
    $scope.submit = function() {
      var options = {
        out: $scope.name
      };
      SingleCallService.aria2.addUri([$scope.url], options, function(err, res) {
        if (err) {
          return Notification.showRpcError("Could not add download", err);
        }
        console.log("Result of addUri", res);
      });
    }
  }]);

require(['/common/init.js', '/common/notification.js'],
function(init, Notification) {
  angular
    .module('external', [])
    .value('Notification', Notification)
    .value('SingleCallService', init.SingleCallService)

    angular.element(document).ready(function() {
      angular.bootstrap(document, ['DownloadAsApp']);
    });
});