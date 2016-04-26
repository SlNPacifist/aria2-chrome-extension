angular
  .module('DownloadAsApp', ['external'])
  .controller('DownloadAsController', ['$scope', 'client', 'Notification',
  function ($scope, client, Notification) {
    chrome.runtime.getBackgroundPage(function setName(background) {
      $scope.$apply(function() {
        $scope.url = background.getDownloadedUrl();
      });
    });
    $scope.submit = function() {
      var options = {
        out: $scope.name
      };
      client.call.aria2.addUri([$scope.url], options, function(err, res) {
        if (err) {
          Notification.showDownloadStartError(err);
        } else {
          Notification.showDownloadStart();
          // If window is closed immediately then notification is not shown
          setTimeout(window.close.bind(window), 100);
        }
      });
    }
  }]);

require(['/common/init.js', '/common/notification.js'],
function(init, Notification) {
  angular
    .module('external', [])
    .value('Notification', Notification)
    .value('client', init.client)

    angular.element(document).ready(function() {
      angular.bootstrap(document, ['DownloadAsApp']);
    });
});