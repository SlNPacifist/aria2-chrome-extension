angular
  .module('DownloadAsApp', ['options', 'AriaLib', 'ClientCreator'])
  .controller('DownloadAsController', ['$scope', 'options', 'AriaLib', 'ClientCreator',
  function ($scope, options, AriaLib, ClientCreator) {
    chrome.runtime.getBackgroundPage(function setName(background) {
      $scope.$apply(function() {
        $scope.url = background.getDownloadedUrl();
      });
    });
    $scope.submit = function() {
      ClientCreator.fromOptions(options.get(), function(err, client) {
        if (err) {
          return;
        }
        var options = {
          out: $scope.name
        }
        client.aria2.addUri([$scope.url], options, function(err, res) {
          console.log("Result of addUri", err, res);
        });
      });
    }
  }]);