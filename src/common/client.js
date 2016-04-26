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
    this._scheduleUpdate();
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
    this._connection.get(function(ariaClient) {
      var currentKeys = Object.keys(this._subscriptions);
      if (currentKeys.length == 0) {
        return this._scheduleUpdate();
      }
      var request = this._collectRequest(keys);
      ariaClient.system.multicall(request, function(err, res) {
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