var FrontEndResponse = new(require("./functions/serverResponseFormat"))();
var ServerLogger = require("./classes/ServerLogger");

//export router
module.exports = function allErrorHandling(err, req, res, next) {
    //CUSTOM EXPRESS ERROR HANDLER
    //create a new response object
    try {
        let response = FrontEndResponse.getNewFrontEndResponse();

        //error handler
        //DISABLE CUSTOM LOGGING FOR NOW
        //all booleans have been handled and logged 
        //errors are just propagating up and then to this custom error handler
        if (typeof err != "boolean") {
            //log code errors before sending a normal error response
            //server error(results is false when an error occurs)
            ServerLogger.writeCodeLogicErrorsToLog(err.message, err.stack);
        }

        //construct response
        response.response = "error"; //set response message
        response.msg = "A problem occurred";
        response.status = 500; //set status message  

        //send response
        res.status(200);
        res.json(response);
    } catch (e) {
        //construct response
        response.response = "error"; //set response message
        response.msg = "A problem occurred";
        response.status = 500; //set status message  

        //send response
        res.status(200);
        res.json(response);
    }

    //comment later
    // next(err); //default express error handler
}