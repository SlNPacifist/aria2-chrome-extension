angular
  .module('OptionsApp', ['external'])
  .controller('OptionsController', ['$scope', 'options', 'TransportCreator',
  function ($scope, options, TransportCreator) {
    var curCheckId = 0;
    function checkOptions() {
      $scope.state = 'connecting';
      curCheckId += 1;
      var checkId = curCheckId;
      TransportCreator.fromOptions($scope.options, function(transport) {
        if (checkId != curCheckId) {
          console.log("Too late");
          return;
        }
        $scope.$apply(function() {
          if (transport) {
            $scope.state = 'connected';
          } else {
            $scope.state = 'error';
          }
        });
      });
    }
    $scope.options = options.get();
    checkOptions();
    $scope.$watch('options', function(val) {
      options.set(val);
      checkOptions();
    }, true);
  }]);

require(['/common/transport_creator.js', '/common/options.js'],
function(TransportCreator, Options) {
  angular
    .module('external', [])
    .value('TransportCreator', TransportCreator)
    .value('options', Options)

    angular.element(document).ready(function() {
      angular.bootstrap(document, ['OptionsApp']);
    });
});