'use strict';

var Formatter = require('./formatter');

var Logger = function(namespace, debugFn, formatter) {
  this.namespace = namespace;
  this.debugger = debugFn;
  this.formatter = formatter;
};

Logger.prototype = {
  addTransactionLogger: function(transactionLogger) {
    this.transactionLogger = transactionLogger;
  },

  log: function(event, data) {
    this.debugger(this.formatter.log(event, data));
  },

  success: function(event, data) {
    this.debugger(this.formatter.success(event, data));
  },

  error: function(event, errorMessage, data) {
    this._error.call(this, event, errorMessage, data, 'error');
  },

  sanityError: function(event, errorMessage, data) {
    this._error.call(this, event, errorMessage, data, 'sanityError');
  },

  _error: function(event, errorMessage, data, logFunction) {
    if (errorMessage instanceof Error) {
      data = Object.assign({ stack: errorMessage.stack }, errorMessage, data);

      errorMessage = errorMessage.message;
    }
    this.debugger(this.formatter[logFunction](event, data, errorMessage));
  },

  transactionProperty: function(name, value) {
    if (!this.transactionLogger) return;
    this.transactionLogger.addCustomParameter(name, value);
  }
};

function newrelicInDebugMode() {
  return process.env.NEW_RELIC_LICENSE_KEY
         && process.env.NEW_RELIC_CAPTURE_PARAMS_ENABLE
         && ['trace', 'debug'].indexOf(process.env.NEW_RELIC_LOGGING_LEVEL) !== -1;
}

module.exports = function(namespace) {
  var logger = new Logger(namespace, require('debug')(namespace), new Formatter(namespace));
  if (newrelicInDebugMode()) logger.addTransactionLogger(require('newrelic'));
  return logger;
};

module.exports.Logger = Logger;
