define(['/libs/async.js'], function(async) {
  var ARIA2_METHODS = [
    'addUri', 'addTorrent', 'addMetalink', 'remove', 'forceRemove', 'pause', 'pauseAll', 'forcePause',
    'forcePauseAll', 'unpause', 'unpauseAll', 'tellStatus', 'getUris', 'getFiles', 'getPeers',
    'getServers', 'tellActive', 'tellWaiting', 'tellStopped', 'changePosition', 'changeUri',
    'getOption', 'changeOption', 'getGlobalOption', 'changeGlobalOption', 'getGlobalStat',
    'purgeDownloadResult', 'removeDownloadResult', 'getVersion', 'getSessionInfo', 'shutdown',
    'forceShutdown', 'saveSession'
  ];

  var SYSTEM_METHODS = ['multicall', 'listMethods'];

  function createCallSynonym(requestName, checkThrottling) {
    return function() {
      var callback = arguments[arguments.length - 1];
      var params = [];
      for (var i = 0; i < arguments.length - 1; i++) {
        params.push(arguments[i]);
      }
      this.call(requestName, params, callback);
    }
  }

  function Client(connection) {
    this._connection = connection;
    this.options = {
      interval: 1000
    }

    this.aria2 = {};
    ARIA2_METHODS.forEach(function(name) {
      this.aria2[name] = createCallSynonym('aria2.' + name, true).bind(this);
    }.bind(this));

    this.system = {};
    SYSTEM_METHODS.forEach(function(name) {
      this.system[name] = createCallSynonym('system.' + name, false).bind(this);
    }.bind(this));

    this._subscriptions = {};
    this._subscriptionsCounter = 0;
    this._lastUpdateTime = 0;

    this._update = this._update.bind(this);
    this._scheduleUpdate();
  }

  Client.prototype.call = function call(requestName, params, callback) {
    var isFinished = false;
    var finishCall = finishCall.bind(this);
    var success = async.apply(finishCall, false);
    var failHandler = setTimeout(async.apply(finishCall, true), 3000);
    this._connection.get(success);

    function finishCall(isTimedOut, client) {
      if (isFinished) {
        console.error("Client call is finished twice");
        return;
      }
      isFinished = true;
      if (isTimedOut) {
        this._connection.revoke(success);
        callback(new Error('No connection available'));
      } else {
        clearTimeout(failHandler);
        client.call(requestName, params, callback);
      }
    };
  }

  Client.prototype.subscribe = function subscribe(requestName, params, callback) {
    console.debug("Adding subscription for", requestName, params);
    var id = this._subscriptionsCounter;
    this._subscriptions[id] = {
      requestName: requestName,
      params: params,
      callback: callback
    }
    this._subscriptionsCounter += 1;
    return id;
  }

  Client.prototype._collectRequest = function collectRequest(keys) {
    return keys.map(function(key) {
      var sub = this._subscriptions[key];
      return {
        methodName: sub.requestName,
        params: sub.params
      }
    }.bind(this));
  }

  Client.prototype._update = function update() {
    this._lastUpdateTime = Date.now();
    var keys = Object.keys(this._subscriptions);
    console.debug("Performing subscriptions update for " + keys.length + " subscriptions");
    if (keys.length == 0) {
      return this._scheduleUpdate();
    }
    this._connection.get(function(client) {
      var currentKeys = Object.keys(this._subscriptions);
      if (currentKeys.length == 0) {
        return this._scheduleUpdate();
      }
      var request = this._collectRequest(keys);
      client.system.multicall(request, function(err, res) {
        if (err) {
          // TODO: log error
          return;
        }
        res.forEach(function(curResult, index) {
          var key = currentKeys[index];
          var sub = this._subscriptions[key];
          if (!Array.isArray(curResult)) {
            if (sub) {
              console.error("Subscription", sub.name, "got error", curResult);
            } else {
              console.error("Removed subscription got error", curResult);
            }
          }
          if (!sub) {
            return;
          }
          sub.callback(curResult);
        }.bind(this));
        this._scheduleUpdate();
      }.bind(this));
    }.bind(this));
  }

  Client.prototype._scheduleUpdate = function scheduleUpdate() {
    var nextUpdate = this._lastUpdateTime + this.options.interval;
    var delta = Math.max(0, nextUpdate - Date.now());
    console.debug("Scheduling update in " + delta + "ms");
    setTimeout(this._update, delta);
  }

  return Client;
});