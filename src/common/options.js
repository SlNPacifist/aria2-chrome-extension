window.Options = (function() {
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
  return {
    get: get,
    set: set
  };
})();