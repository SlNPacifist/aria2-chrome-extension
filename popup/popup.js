var AriaLib = require('aria2-client');
AriaLib.transport.Websocket.fromUrl('ws://192.168.0.103:6800/jsonrpc', function(err, transport) {
  if (err) {
    return console.error("Could not create transport", err);
  }
  var client = new AriaLib.AriaClient(transport);
  client.aria2.getVersion(function(err, res) {
    document.getElementById('list-container').innerHTML = JSON.stringify(err || res);
  });
});