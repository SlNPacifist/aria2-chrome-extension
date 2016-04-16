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
    get: get.bind(res),
    set: set.bind(res)
  };
  window.Options = res;
})();