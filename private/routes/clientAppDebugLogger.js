const FrontEndResponse = new (require("../functions/serverResponseFormat"))();
const ServerLogger = require("../classes/ServerLogger");
const _ = require('lodash');

//export router
module.exports = function (app,express)
{
    var routerAPI = express.Router();

    /*
     * Deal with post request
     */
    routerAPI.post('/debug_info',function(req,res,next)
    {
        try
        {
            //create a new response object
            let response = FrontEndResponse.getNewFrontEndResponse();

            //get form fields and construct response
            //date saved may be needed if error was saved locally for some time
            //before sending to server
            let errorInfo = req.body.errorInfo ? req.body.errorInfo : null;;
            let dateSaved = req.body.dateSaved ? req.body.dateSaved : null;;
            
            if(!_.isEmpty(errorInfo) && !_.isNull(errorInfo))
            {
                //log client side debug information
                ServerLogger.writeClientSideDebugInfoToFile(JSON.stringify(errorInfo),dateSaved);
            }

            response.response = "okay";
            response.status = 200;
            response.msg = "Successfull";

            //render response
            res.status = 200;
            res.json(response);
        }catch(err){
            next(err);
        }
    }); //end of route

    return routerAPI;
};//end of exports
