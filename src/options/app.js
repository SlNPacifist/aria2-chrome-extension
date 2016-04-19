angular
  .module('OptionsApp', ['options', 'ClientCreator'])
  .controller('OptionsController', ['$scope', 'options', function ($scope, options) {
    var curCheckId = 0;
    function checkOptions() {
      $scope.state = 'connecting';
      curCheckId += 1;
      var checkId = curCheckId;
      ClientCreator.fromOptions($scope.options, function(transport) {
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