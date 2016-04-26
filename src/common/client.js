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

  var SUBSCRIPTION_METHODS = [
    'tellStatus', 'getUris', 'getFiles', 'getPeers', 'getServers', 'tellActive', 'tellWaiting', 'tellStopped',
    'getOption', 'getGlobalOption', 'getGlobalStat', 'getVersion', 'getSessionInfo'
  ];

  function getShorthand(requestName, methodName) {
    return function() {
      var callback = arguments[arguments.length - 1];
      var params = [];
      for (var i = 0; i < arguments.length - 1; i++) {
        params.push(arguments[i]);
      }
      return this[methodName](requestName, params, callback);
    }
  }

  function createShorthands(target) {
    target.call = target.call.bind(target);
    target.call.aria2 = {};
    ARIA2_METHODS.forEach(function(name) {
      target.call.aria2[name] = getShorthand('aria2.' + name, 'call').bind(target);
    }.bind(target));

    target.call.system = {};
    SYSTEM_METHODS.forEach(function(name) {
      target.call.system[name] = getShorthand('system.' + name, 'call').bind(target);
    }.bind(target));

    target.subscribe = target.subscribe.bind(target);
    target.subscribe.aria2 = {};
    SUBSCRIPTION_METHODS.forEach(function(name) {
      target.subscribe.aria2[name] = getShorthand('aria2.' + name, 'subscribe').bind(target);
    }.bind(target));
  }

  function Client(connection) {
    this._connection = connection;
    this.options = {
      interval: 1000
    }

    createShorthands(this);

    this._subscriptions = {};
    this._subscriptionsCounter = 0;
    this._lastUpdateTime = 0;
    this._update = this._update.bind(this);
  }

  Client.prototype.call = function call(requestName, params, callback) {
    var isFinished = false;
    var finishCall = finishCall.bind(this);
    var success = async.apply(finishCall, false);
    var failHandler = setTimeout(async.apply(finishCall, true), 3000);
    this._connection.get(success);

    function finishCall(isTimedOut, ariaClient) {
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
        ariaClient.call(requestName, params, callback);
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
    this._scheduleUpdate();
    return id;
  }

  Client.prototype.unsubscribe = function unsubscribe(id) {
    delete this._subscriptions[id];
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
    var self = this;
    this._lastUpdateTime = Date.now();
    var currentKeys;

    async.waterfall([
      function(callback) {callback(getKeys().length == 0 ? true : null)},
      getConnection,
      makeRequest,
      processResult
    ], finishUpdate);

    function getKeys() {
      var keys = Object.keys(self._subscriptions);
      console.debug("Performing subscriptions update for " + keys.length + " subscriptions");
      return keys;
    }

    function getConnection(callback) {
      self._connection.get(async.apply(callback, null));
    }

    function makeRequest(ariaClient, callback) {
      var keys = getKeys();
      if (keys.length == 0) {
        return callback(true);
      }
      var request = self._collectRequest(keys);
      currentKeys = keys;
      ariaClient.system.multicall(request, callback);
    }

    function processResult(res, callback) {
      res.forEach(function(curResult, index) {
        var key = currentKeys[index];
        var sub = self._subscriptions[key];
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
      });
      callback(null);
    }

    function finishUpdate(err) {
      self._updateTimeoutHandler = null;
      self._scheduleUpdate();
    }
  }

  Client.prototype._scheduleUpdate = function scheduleUpdate() {
    if (this._updateTimeoutHandler) {
      // Update has been scheduled or in process
      return;
    }
    if (Object.keys(this._subscriptions).length == 0) {
      // No active subscriptions
      return;
    }
    var nextUpdate = this._lastUpdateTime + this.options.interval;
    var delta = Math.max(0, nextUpdate - Date.now());
    console.debug("Scheduling update in " + delta + "ms");
    this._updateTimeoutHandler = setTimeout(this._update, delta);
  }

  return Client;
});