'use strict';

var Formatter = function(namespace) {
  this.namespace = namespace;
};

Formatter.prototype = {
  log: function(event, data) {
    return this._composeLog(event, data);
  },

  success: function(event, data) {
    return this._composeLog(event, data, ['result="success"']);
  },

  error: function(event, data, errorMessage) {
    return this._composeLog(event, data, ['result="error"', 'errorMessage="' + errorMessage + '"']);
  },

  sanityError: function(event, data, errorMessage) {
    return this._composeLog(event, data, ['result="error"', 'triggeredBy="sanityCheck"', 'errorMessage="' + errorMessage + '"']);
  },

  _composeLog: function(event, data, tags) {
    return this._getPrefix(event) + ' ' + (tags ? tags.join(' ') : '') + this._prepareData(data)
  },

  _getPrefix: function(event) {
    return 'type="' + this.namespace + '" event="' + event + '"';
  },

  _prepareData: function(data) {
    if (Object.prototype.toString.call(data) === "[object Object]" && Object.getPrototypeOf(data) === Object.prototype) {
      var tags = [];
      for (var key in data) {
        if (!data.hasOwnProperty(key)) {
          continue;
        }

        tags.push(function(value, key) {
          if (typeof value === 'string') {
            value = JSON.stringify(value);
          } else {
            value = '"' + JSON.stringify(value) + '"';
          }

          return key + '=' + value;
        }(data[key], key));
      }

      data = tags.join(' ');
    }

    return data ? ' ' + data : '';
  }
};

module.exports = Formatter;
