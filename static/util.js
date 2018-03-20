var util = {
  EventEmitter: function () {
    var listeners = [];
    return {
      on: function (eventName, callback) {
        if (!listeners[eventName]) {
          listeners[eventName] = [];
        }
        listeners[eventName].push(callback);
        return this;
      },
      off: function (eventName, callback) {
        for (var i = 0, len = listeners[eventName].length; i < len; i++) {
          if (listeners[eventName][i] === callback)
            return listeners[eventName].splice(i, 1), true;
        }
        return false;
      },
      emit: function (eventName, params) {
        if (typeof listeners[eventName] == 'undefined') {
          return;
        }
        for (var i = 0, len = listeners[eventName].length; i < len; i++) {
          listeners[eventName][i](params);
        }
      }
    }
  }
}
