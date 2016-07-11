'use strict';

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));


const Logger = require('./').Logger;
const Formatter = require('./formatter');


describe('Logger', function() {
  let logger;

  beforeEach(function() {
    const debugSpy = sinon.spy();
    logger = new Logger('testnamespace', debugSpy, new Formatter('testnamespace'));

    this.expectDebugMessageMatch = function(re) {
      expect(debugSpy).to.have.been.calledWithMatch(re);
    };
  });


  describe('common functionalities for normal log methods', function() {

    ['log', 'success'].forEach(function(logFunction) {
      describe('#' + logFunction, function() {

        it('should log the namespace and the given event name', function() {
          logger[logFunction]('test');
          this.expectDebugMessageMatch(/type="testnamespace"/);
          this.expectDebugMessageMatch(/event="test"/);
        });


        it('should log the given object properties as log property', function() {
          logger[logFunction]('test', { par: 1, opar: 2 });
          this.expectDebugMessageMatch(/par="1" opar="2"/);
        });

      });
    });

  });


  describe('common functionalities for error log methods', function() {

    ['error', 'sanityError'].forEach(function(logFunction) {
      describe('#' + logFunction, function() {

        it('should log the namespace and the given event name', function() {
          logger[logFunction]('test', 'tData');
          this.expectDebugMessageMatch(/type="testnamespace"/);
          this.expectDebugMessageMatch(/event="test"/);
        });


        it('should log the error message', function() {
          logger[logFunction]('test', 'emessage');
          this.expectDebugMessageMatch(/errorMessage="emessage"/);
        });


        it('should set the correct error message if Error object was given', function() {
          logger[logFunction]('test', new Error('emessage'));
          this.expectDebugMessageMatch(/errorMessage="emessage"/);
        });


        it('should log the result attribute as error', function() {
          logger[logFunction]('test', 'emessage');
          this.expectDebugMessageMatch(/result="error"/);
        });


        it('should log the given object properties as log property', function() {
          logger[logFunction]('test', 'emessage', { par: 1, opar: 2 });
          this.expectDebugMessageMatch(/par="1" opar="2"/);
        });

      });
    });

  });


  describe('#success', function() {

    it('should log the result attribute as success', function() {
      logger.success('test');
      this.expectDebugMessageMatch(/result="success"/);
    });

  });


  describe('#sanityError', function() {

    it('should log the triggered by attribute as sanity check', function() {
      logger.sanityError('test', 'emessage');
      this.expectDebugMessageMatch(/triggeredBy="sanityCheck"/);
    });

  });


  describe('#exception handling', function() {
    let exception;

    beforeEach(function() {
      exception = new Error('emessage');
      exception.code = 12345
    });


    it('should log the given error object as data', function() {
      logger.error('test', exception);
      this.expectDebugMessageMatch(/code="12345"/);
      this.expectDebugMessageMatch(/stack="/);
    });


    it('should extend the given data with the error object', function() {
      logger.error('test', exception, { par: 1 });
        this.expectDebugMessageMatch(/code="12345"/);
        this.expectDebugMessageMatch(/par="1"/);
    });


    it('should not overwrite the given data with the error object\s property', function() {
      logger.error('test', exception, { code: 67890 });
      this.expectDebugMessageMatch(/code="67890"/);
    });

  });

  describe('#transactionProperty', function() {
    let newrelicMock;

    beforeEach(function() {
      newrelicMock = { addCustomParameter: sinon.spy() };
    });


    it('should log the given key value with given transactionlogger', function() {
      logger.addTransactionLogger(newrelicMock);
      logger.transactionProperty('test', 'data');
      expect(newrelicMock.addCustomParameter).to.have.been.calledWith('test', 'data');
    });


    it('should return with false without transactionlogger', function() {
      const returnValue = logger.transactionProperty('test', 'data');
      expect(returnValue).to.be.not.ok;
    });

  });

});
