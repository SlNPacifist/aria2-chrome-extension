angular
  .module('OptionsApp', ['options'])
  .controller('OptionsController', ['$scope', 'options', function ($scope, options) {
    $scope.options = options.get();
    $scope.$watch('options', function(val) {
      options.set(val);
    }, true);
  }]);