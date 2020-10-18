//ADMIN OPERATIONS ROUTES
//export router
//require necessary class(es)

const _ = require('lodash');
const moment = require('moment');
const Promise = require("bluebird");
const adminOperations = require("../../classes/adminOperations");
const validate = require('../../functions/validate');
const FrontEndResponse = new(require("../../functions/serverResponseFormat"))();
const userAccountSettings = require('../../classes/userAccountSettings');

//export router
module.exports = function(app, express) {
    var router = express.Router();



    /**
     * =================================================
     *   UPDATE RESTAURANT CONFIGURATION INFORMATION
     * =================================================
     */
    router.post('/newconfiguration', function(req, res, next) {
        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;
        let userType = req.decoded.accountType;

        let update = req.body;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();



        //after form validations..will update later
        if (true) {

            //instantiate adminOperations class
            let adminOp = new adminOperations(app.locals.connection, userID, restaurantID);

            adminOp.saveConfigInformation(update)
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
        } else {
            //memory management
            formValid = null;
            f = null;

            //construct response
            response.response = "form"; //set response message
            response.status = 200; //set status message
            response.msg = "Problem with update";

            // response.form = fInfo;

            //send response
            res.status(200);
            res.json(response);
        }
    });

    /**
     * ========================================
     *  GET RESTAURANT CONFIGURATION INFORMATION
     * ========================================
     */
    router.get('/configuration', function(req, res, next) {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //instantiate adminOperations class
        let newAdminOp = new adminOperations(app.locals.connection, userID, restaurantID);


        //retrieve restaurant configuration info from admin operations class
        newAdminOp.getConfigInformation()
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
    });



    /**
     * =================================================
     *   UPDATE RESTAURANT CONFIGURATION INFORMATION
     * =================================================
     */
    router.post('/configuration', function(req, res, next) {
        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;
        let userType = req.decoded.accountType;

        let newConfig = req.query.ifNew == "true" ? true : false;

        let update = req.body;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();



        if (true) {
            let saveConfig = 'saveConfigInformation';
            let updateConfig = 'updateConfigInformation';
            let operation = '';
            if (newConfig) {
                operation = saveConfig
            } else {
                operation = updateConfig;
            }
            //instantiate adminOperations class
            let adminOp = new adminOperations(app.locals.connection, userID, restaurantID);

            adminOp[operation](update)
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
        } else {
            //memory management
            formValid = null;
            f = null;

            //construct response
            response.response = "form"; //set response message
            response.status = 200; //set status message
            response.msg = "Problem with update";

            // response.form = fInfo;

            //send response
            res.status(200);
            res.json(response);
        }
    });

    router.get('/restaurantstats', function(req, res, next) {
        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;
        let userType = req.decoded.accountType;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //instantiate adminOperations class
        let adminOp = new adminOperations(app.locals.connection, userID, restaurantID);
        adminOp.getRestaurantStats()
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

    });

    router.get('/restaurantinformation', (req, res, next) => {
        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;
        let userType = req.decoded.accountType;

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