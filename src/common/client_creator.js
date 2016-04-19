(function() {
  /**
   * Creates appropriate Aria2 client connection from options.
   */
  function createTransport(config, callback) {
    switch (config.transportName) {
      case 'xhr':
        callback(null, new AriaLib.transport.Xhr(config.url));
        break;
      case 'websocket':
        AriaLib.transport.Websocket.fromUrl(config.url, callback);
        break;
      default:
        throw new Error('Unknown transport ' + config.transportName);
    }
  }

  function getPossibleConfigs(options) {
    var host = options.host || 'localhost';
    var port = options.port || '6800';
    var encryptions = [true];
    if (!options.forceEncryption) {
      encryptions.push(false);
    }
    var transports = ['xhr', 'websocket'];
    var configs = [];
    encryptions.forEach(function(useEncryption) {
      transports.forEach(function(transport) {
        if (transport == 'xhr') {
          var proto = 'http';
        } else if (transport == 'websocket') {
          var proto = 'ws';
        }
        if (useEncryption) {
          proto += 's';
        }
        var url = proto + '://' + host + ':' + port + '/jsonrpc';
        configs.push({
          transportName: transport,
          url: url
        });
      });
    });
    return configs;
  }

  function checkConfig(config, callback) {
    createTransport(config, function(err, transport) {
      if (err) {
        return callback();
      }
      var client = new AriaLib.AriaClient(transport);
      transport.once('error', function() {
        client.cancelAllRequests();
      });
      client.aria2.getVersion(function(err, res) {
        if (!err) {
          config.transport = transport;
        }
        return callback();
      });
    });
  }

  function fromOptions(options, callback) {
    var configs = getPossibleConfigs(options);
    async.each(configs, checkConfig, function(err) {
      if (err) {
        // TODO: log error
        return callback(null);
      }
      for (var i = 0; i < configs.length; i++) {
        var config = configs[i];
        if (config.transport) {
          return callback(config.transport);
        }
      }
      callback(null);
    });
  }

  clientCallbacks = [];
  function whenClientReady(callback) {
    if (ClientCreator.currentClient) {
      return callback(ClientCreator.currentClient);
    } else {
      clientCallbacks.push(callback);
    }
  }

  var clientCreateTimeout = 10000;
  function createCurrentClient() {
    fromOptions(Options.get(), function(transport) {
      if (transport) {
        ClientCreator.current = new AriaLib.AriaClient(transport);
        transport.on('error', function() {
          ClientCreator.current = null;
          createCurrentClient();
        });
        clientCallbacks.forEach(function(callback) {callback(ClientCreator.current)});
        clientCallbacks = [];
      } else {
        window.setTimeout(createCurrentClient, clientCreateTimeout);
      }
    });
  }
  createCurrentClient();

  var ClientCreator = {
    fromOptions: fromOptions,
    whenClientReady: whenClientReady,
    currentClient: null
  };
  window.ClientCreator = ClientCreator;
})();