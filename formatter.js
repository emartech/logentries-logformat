'use strict';

var _ = require('lodash');

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
    if (_.isPlainObject(data)) {
      data = _.map(data, function(value, key) {
        if (_.isString(value)) {
          value = JSON.stringify(value);
        } else {
          value = '"' + JSON.stringify(value) + '"';
        }

        return key + '=' + value;
      }).join(' ');
    }

    return data ? ' ' + data : '';
  }
};

module.exports = Formatter;
