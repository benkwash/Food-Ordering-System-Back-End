/*
 * This class handles the logging of errors/messages
 * Server Logs can be found in ./logs/
 */
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const logDirPath = path.join(__dirname, '../../logs');
const logFile = logDirPath + "/databaseDriverLogs.txt";
const codeLogsFile = logDirPath + "/codeImplementationLogs.txt";
const clientSideDebugFile = logDirPath + "/frontEndAppDebugInfo.txt";
const mailService = new(require("./mailClass"))();

try{
    //CREATING A DIRECTORY MAY THROW AN ERROR IF ALREADY EXIST
    //CONTINUE NORMAL EXECUTION IF IT EXISTS
    //create log directory if not exists
    fs.mkdirSync(logDirPath);
}catch(e){
}

class ServerLogger {
    //msgLoc: error location,method: method generating the error, msg:error message
    static writeToLog(msgLoc, method, msg) {
        let that = this;
        //generate current timestamp(Datetime) in UTC format
        let timestamp = moment.utc().format();
        let logMsg = "\nERROR: DateTime:" + timestamp + "loc:" + msgLoc + "  Method:" + method;
        logMsg += "\nERROR MSG:" + msg;

        let subject = "writeToLog Error";

        //write to log file
        fs.appendFile(logFile, logMsg, (err) => { /*console.log(err);*/ });
        //send error to mail
        // mailService.sendMailToDevelopers(subject, logMsg);
    }

    //error message and stacktrace
    static writeCodeLogicErrorsToLog(errorMsg, stacktrace) {
        //generate current timestamp(Datetime) in UTC format
        //add stacktrace and message
        let timestamp = moment.utc().format();
        let logMsg = "\n CODE ERROR: DateTime:" + timestamp + ":=>" + errorMsg;
        logMsg += "\n STACKTRACE:" + stacktrace;

        let subject = "writeCodeLogicErrorsTolog";

        //write to log file
        fs.appendFile(codeLogsFile, logMsg, (err) => { /*console.log(err);*/ });
        //send error to mail
        mailService.sendMailToDevelopers(subject, logMsg);
    }

    /**
     *  date saved may be needed if error was saved locally for some time
     * @param {object} debugInfo 
     * @param {String|Null} dateSaved 
     * @return {Void}
     */
    //before sending to server
    static writeClientSideDebugInfoToFile(debugInfo,dateSaved) {
        //generate current timestamp(Datetime) in UTC format
        //add stacktrace and message
        
        //used the provided date saved or use the current utc(time)
        let timestamp = dateSaved ? moment(dateSaved).utc().format() : moment.utc().format();

        let logMsg = "\n ERROR: DateTime:" + timestamp;
        logMsg += "\n DEBUG INFO:" + debugInfo;

        let subject = "writeClientSideDebugInfoToFile";

        //write to log file
        fs.appendFile(clientSideDebugFile, logMsg, (err) => { /*console.log(err);*/ });
        //send error to mail
        mailService.sendMailToDevelopers(subject, logMsg);
    }

}

//export
module.exports = ServerLogger;