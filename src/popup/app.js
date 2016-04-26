angular
  .module('PopupApp', ['external'])
  .controller('PopupController', ['$scope', 'client',
  function ($scope, client) {
    $scope.info = "Connecting";
    client.subscribe('aria2.getVersion', [], function(err, res) {
      $scope.$apply(function() {
        console.log("Updating version");
        $scope.info = err || res;
      });
    });
  }]);

require(['/common/init.js'],
function(init) {
  angular
    .module('external', [])
    .value('client', init.client);

    angular.element(document).ready(function() {
      angular.bootstrap(document, ['PopupApp']);
    });
});