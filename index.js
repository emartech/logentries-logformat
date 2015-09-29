'use strict';

var _ = require('lodash');

var Logger = function(namespace, debugFn) {
  this.namespace = namespace;
  this.debugger = debugFn;
};

Logger.prototype = {
  addTransactionLogger: function(transactionLogger) {
    this.transactionLogger = transactionLogger;
  },

  log: function(event, data) {
    this.debugger(this._getPrefix(event) + this._prepareData(data));
  },

  success: function(event, data) {
    this.debugger(this._getPrefix(event) + ' result=success' + this._prepareData(data));
  },

  error: function(event, errorMessage, data) {
    this.debugger(this._getPrefix(event) +' result=error errorMessage="' + errorMessage + '"' + this._prepareData(data));
  },

  sanityError: function(event, errorMessage, data) {
    this.debugger(this._getPrefix(event) +' result=error triggeredBy=sanityCheck errorMessage="' + errorMessage + '"' + this._prepareData(data));
  },

  transactionProperty: function(name, value) {
    if (!this.transactionLogger) return;
    this.transactionLogger.addCustomParameter(name, value);
  },

  _getPrefix: function(event) {
    return 'type="' + this.namespace + '" event="' + event + '""';
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

function newrelicInDebugMode() {
  return process.env.NEW_RELIC_LICENSE_KEY
         && process.env.NEW_RELIC_CAPTURE_PARAMS_ENABLE
         && _.contains(['trace', 'debug'], process.env.NEW_RELIC_LOGGING_LEVEL);
}

module.exports = function(namespace) {
  var logger = new Logger(namespace, require('debug')(namespace));
  if (newrelicInDebugMode()) logger.addTransactionLogger(require('newrelic'));
  return logger;
};

module.exports.Logger = Logger;
