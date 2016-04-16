(function() {
  function fromOptions(options, callback) {
    var url = 'ws://' + options.host + ':' + options.port + '/jsonrpc';
    AriaLib.transport.Websocket.fromUrl(url, function(err, transport) {
      if (err) {
        return callback(err);
      }
      var client = new AriaLib.AriaClient(transport);
      callback(null, client);
    });
  }
  window.ClientCreator = {
    fromOptions: fromOptions
  };
})();