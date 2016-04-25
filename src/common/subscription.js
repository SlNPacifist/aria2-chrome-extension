window.Subscription = (function() {
  function Subscription() {
    this._subscriptions = {};
    this._subscriptionsCounter = 0;
    this._lastUpdateTime = 0;
    this.options = {
      interval: 1000
    }
    this._update = this._update.bind(this);
    this._scheduleUpdate();
  }

  Subscription.prototype.subscribe = function subscribe(requestName, params, callback) {
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

  Subscription.prototype._collectRequest = function collectRequest(keys) {
    return keys.map(function(key) {
      var sub = this._subscriptions[key];
      return {
        methodName: sub.requestName,
        params: sub.params
      }
    }.bind(this));
  }

  Subscription.prototype._update = function update() {
    this._lastUpdateTime = Date.now();
    var keys = Object.keys(this._subscriptions);
    console.debug("Performing subscriptions update for " + keys.length + " subscriptions");
    if (keys.length == 0) {
      return this._scheduleUpdate();
    }
    ConnectionService.get(function(client) {
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

  Subscription.prototype._scheduleUpdate = function scheduleUpdate() {
    var nextUpdate = this._lastUpdateTime + this.options.interval;
    var delta = Math.max(0, nextUpdate - Date.now());
    console.debug("Scheduling update in " + delta + "ms");
    setTimeout(this._update, delta);
  }

  return Subscription;
})();

window.SubscriptionService = new Subscription();