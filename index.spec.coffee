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

        it "should log the result attribute as error", ->
          logger[logFunction] "test", "emessage"
          expect(debugSpy).to.have.been.calledWithMatch /result="error"/

        it "should log the given object properties as log property", ->
          logger[logFunction] "test", "emessage", { par: 1, opar: 2 }
          expect(debugSpy).to.have.been.calledWithMatch /par="1" opar="2"/

        it "should log the given log data as it is if it is a string", ->
          logger[logFunction] "test", "emessage", "#data#"
          expect(debugSpy).to.have.been.calledWithMatch /#data#/

        it "should log the given log data as it is if it is a boolean", ->
          logger[logFunction] "test", "emessage", true
          expect(debugSpy).to.have.been.calledWithMatch /\btrue\b/

        it "should log the given log data as ISO 8601 in UTC timezone if it is a Date", ->
          logger[logFunction] "test", "emessage", new Date('2015-09-15 02:00:00 +0200')
          expect(debugSpy).to.have.been.calledWithMatch /2015-09-15T00:00:00.000Z/

        it "should not log the given log data if it is not a string or plain object", ->
          logger[logFunction] "test", "emessage", ->
          expect(debugSpy).to.not.have.been.calledWithMatch /function/


  describe "#success", ->
    it "should log the result attribute as success", ->
      logger.success "test"
      expect(debugSpy).to.have.been.calledWithMatch /result="success"/

  describe "#sanityError", ->
    it "should log the triggered by attribute as sanity check", ->
      logger.sanityError "test", "emessage"
      expect(debugSpy).to.have.been.calledWithMatch /triggeredBy="sanityCheck"/

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
