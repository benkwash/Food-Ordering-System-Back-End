//STAFF OPERATIONS ROUTES
//export router
//require necessary classes/dependencies

const _ = require('lodash');
const moment = require('moment');
const Promise = require("bluebird");
const staffOperations = require("../../classes/employeeOperations");
const adminOperations = require("../../classes/adminOperations");
const validate = require('../../functions/validate');
const FrontEndResponse = new(require("../../functions/serverResponseFormat"))();
const userAccountSettings = require('../../classes/userAccountSettings');

//export router
module.exports = function(app, express) {
    var router = express.Router();

    router.get('/getstaffinformation', (req, res, next) => {
        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //instantiate adminOperations class
        let staffOp = new staffOperations(app.locals.connection, userID, restaurantID);
        staffOp.getStaffInformation(userID)
            .then(function(results) {
                //construct response
                response.response = "okay"; //set response message
                response.status = 200; //set status message

                //set response data field
                response.data.fetched = results;

                //send response
                res.status(200);
                res.json(response);
            }).catch(function(err) {
                //delegate to error handler
                next(err);
            });
    })

    //getrestaurantinfo
    router.get('/getrestaurantinfo', (req, res, next) => {
        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //instantiate adminOperations class
        let adminOp = new adminOperations(app.locals.connection, userID, restaurantID);
        adminOp.getRestaurantInfo()
            .then(function(results) {
                //construct response
                response.response = "okay"; //set response message
                response.status = 200; //set status message

                //set response data field
                response.data.fetched = results;

                //send response
                res.status(200);
                res.json(response);
            }).catch(function(err) {
                //delegate to error handler
                next(err);
            });
    })


    return router;
};