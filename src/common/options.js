(function() {
  function get() {
    if ('options' in localStorage) {
      return JSON.parse(localStorage['options'])
    } else {
      return {}
    }
  }
  function set(options) {
    localStorage['options'] = JSON.stringify(options);
  }
  var res = {
    get: get,
    set: set
  };
  window.Options = res;
})();