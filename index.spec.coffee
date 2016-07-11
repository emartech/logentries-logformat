"use strict"
chai = require "chai"
sinon = require "sinon"
sinonChai = require "sinon-chai"
expect = chai.expect
chai.use sinonChai

Logger = require("./").Logger
Formatter = require "./formatter"

describe "Logger", ->
  logger = undefined
  debugSpy = undefined

  beforeEach ->
    debugSpy = sinon.spy()
    logger = new Logger "testnamespace", debugSpy, new Formatter "testnamespace"

  describe "common functionalities for normal log methods", ->
    [ "log", "success" ].forEach (logFunction) ->
      describe "#" + logFunction, ->
        it "should log the namespace and the given event name", ->
          logger[logFunction] "test"
          expect(debugSpy).to.have.been.calledWithMatch /type="testnamespace"/
          expect(debugSpy).to.have.been.calledWithMatch /event="test"/

        it "should log the given object properties as log property", ->
          logger[logFunction] "test", { par: 1, opar: 2 }
          expect(debugSpy).to.have.been.calledWithMatch /par="1" opar="2"/

  describe "common functionalities for error log methods", ->
    [ "error", "sanityError"].forEach (logFunction) ->
      describe "#" + logFunction, ->
        it "should log the namespace and the given event name", ->
          logger[logFunction] "test", "tData"
          expect(debugSpy).to.have.been.calledWithMatch /type="testnamespace"/
          expect(debugSpy).to.have.been.calledWithMatch /event="test"/

        it "should log the error message", ->
          logger[logFunction] "test", "emessage"
          expect(debugSpy).to.have.been.calledWithMatch /errorMessage="emessage"/

        it "should set the correct error message if Error object was given", ->
          logger[logFunction] "test", new Error "emessage"
          expect(debugSpy).to.have.been.calledWithMatch /errorMessage="emessage"/

        it "should log the result attribute as error", ->
          logger[logFunction] "test", "emessage"
          expect(debugSpy).to.have.been.calledWithMatch /result="error"/

        it "should log the given object properties as log property", ->
          logger[logFunction] "test", "emessage", { par: 1, opar: 2 }
          expect(debugSpy).to.have.been.calledWithMatch /par="1" opar="2"/


  describe "#success", ->
    it "should log the result attribute as success", ->
      logger.success "test"
      expect(debugSpy).to.have.been.calledWithMatch /result="success"/

  describe "#sanityError", ->
    it "should log the triggered by attribute as sanity check", ->
      logger.sanityError "test", "emessage"
      expect(debugSpy).to.have.been.calledWithMatch /triggeredBy="sanityCheck"/

  describe "#exception handling", ->
    exception = undefined

    beforeEach ->
      exception = new Error "emessage"
      exception.code = 12345

    it "should log the given error object as data", ->
      logger.error "test", exception
      expect(debugSpy).to.have.been.calledWithMatch /code="12345"/
      expect(debugSpy).to.have.been.calledWithMatch /stack="/

    it "should extend the given data with the error object", ->
      logger.error "test", exception, { par: 1 }
      expect(debugSpy).to.have.been.calledWithMatch /code="12345"/
      expect(debugSpy).to.have.been.calledWithMatch /par="1"/

    it "should not overwrite the given data with the error object\s property", ->
      logger.error "test", exception, { code: 67890 }
      expect(debugSpy).to.have.been.calledWithMatch /code="67890"/

  describe "#transactionProperty", ->
    newrelicMock = undefined

    beforeEach ->
      newrelicMock = { addCustomParameter: sinon.spy() }

    describe "with given transactionlogger", ->
      it 'should log the given key value', ->
        logger.addTransactionLogger newrelicMock
        logger.transactionProperty 'test', 'data'
        expect(newrelicMock.addCustomParameter).to.have.been.calledWith 'test', 'data'

    describe "without transactionlogger", ->
      it 'should return with false', ->
        returnValue = logger.transactionProperty 'test', 'data'
        expect(returnValue).to.be.not.ok
