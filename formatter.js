'use strict';

var Formatter = function(namespace) {
  this.namespace = namespace;
};

Formatter.prototype = {
  log: function(event, data) {
    return this._composeLog(event, data);
  },

  success: function(event, data) {
    return this._composeLog(event, data, { result: 'success' });
  },

  error: function(event, data, errorMessage) {
    return this._composeLog(event, data, { result: 'error', errorMessage: errorMessage });
  },

  sanityError: function(event, data, errorMessage) {
    return this._composeLog(event, data, { result: 'error', triggeredBy: 'sanityCheck', errorMessage: errorMessage });
  },

  _composeLog: function(event, data, extraTags) {
    var tags = extraTags || {};

    tags.event = event;
    tags.type = this.namespace;

    return this._composeTags(tags) + this._prepareData(data)
  },

  _prepareData: function(data) {
    var retval;
    if (['string', 'number', 'boolean'].indexOf(typeof data) !== -1) {
      retval = data.toString();
    }
    else if (data instanceof Date) {
      retval = (new Date(data.toUTCString())).toISOString();
    }
    else if (Object.prototype.toString.call(data) === "[object Object]" && Object.getPrototypeOf(data) === Object.prototype) {
      retval = this._composeTags(data);
    }
    else {
      retval = '';
    }

    return retval ? ' ' + retval : '';
  },

  _composeTags: function(tags) {
    var dataTags = [];
    for (var key in tags) {
      if (!tags.hasOwnProperty(key)) {
        continue;
      }

      dataTags.push(this._tagToString(key, tags[key]));
    }

    return dataTags.join(' ');
  },

  _tagToString: function(name, tagValue) {
    var value;
    if (typeof tagValue == 'string') {
      value = JSON.stringify(tagValue);
    } else {
      value = '"' + JSON.stringify(tagValue) + '"';
    }

    return name + '=' + value;
  }
};

module.exports = Formatter;
