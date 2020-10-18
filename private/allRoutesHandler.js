var FrontEndResponse = new(require("./functions/serverResponseFormat"))();

//export router
module.exports = function allRoutesHandler(req, res, next) {
    //last route that is called when no route(request route) has been matched
    //like a 404 or notfound route

    //create a new response object
    let response = FrontEndResponse.getNewFrontEndResponse();

    //construct response
    response.response = "error"; //set response message
    response.msg = "Page or Resource not found";
    response.status = 404; //set status message  

    //send response
    res.status(200);
    res.json(response);
}