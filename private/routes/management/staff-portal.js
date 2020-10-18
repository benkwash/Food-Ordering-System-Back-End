let employeeClass = require('../../classes/employeeOperations');
const _ = require('lodash');
const moment = require('moment');
const Promise = require("bluebird");
const validate = require('../../functions/validate');
const FrontEndResponse = new (require("../../functions/serverResponseFormat"))();
const userAccountSettings = require('../../classes/userAccountSettings');


//define routes for restaurant staff management
module.exports = function (app, express) {
    let appRoutes = express.Router();

    //get one staff information
    appRoutes.get('/getstaffinfo', (req, res, next) => {
        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        let staffID = req.query.staffID;

        if (staffID != "" || staffID != null) {
            let empClass = new employeeClass(app.locals.connection, userID, restaurantID);

            return empClass.retrieveEmployeeInfoWithDocID(staffID)
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function (err) {
                    //delegate to error handler
                    next(err);
                });

        } else {
            //construct response
            response.response = "form"; //set response message
            response.status = 200; //set status message
            response.msg = "Couldn't get staff information";

            // response.form = fInfo;

            //send response
            res.status(200);
            res.json(response);

        }


    })

    //get all staff information of a particular restaurant
    appRoutes.get('/getallstaffinfo', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();
        //after validations
        if (true) {
            let empClass = new employeeClass(app.locals.connection, userID, restaurantID);

            return empClass.getAllStaffInformation()
                .then((returned) => {

                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);

                }).catch(function (err) {
                    //delegate to error handler
                    next(err);
                });

        } else {
            //construct response
            response.response = "form"; //set response message
            response.status = 200; //set status message
            response.msg = "Couldn't get staff information";

            // response.form = fInfo;

            //send response
            res.status(200);
            res.json(response);
        }
    })


    appRoutes.post('/savenewstaff', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let staffInfo = req.body;
        let response = FrontEndResponse.getNewFrontEndResponse();

        //after validations.will update later
        if (true) {
            let empClass = new employeeClass(app.locals.connection, userID, restaurantID);


            return empClass.saveStaffInfo(staffInfo)
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function (err) {
                    //delegate to error handler
                    next(err);
                });

        } else {
            //construct response
            response.response = "form"; //set response message
            response.status = 200; //set status message
            response.msg = "Problem with update";

            // response.form = fInfo;

            //send response
            res.status(200);
            res.json(response);
        }



    })

    appRoutes.post('/updatestaffinfo', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let staffInfo = req.body;
        let response = FrontEndResponse.getNewFrontEndResponse();

        //after validations.will update later
        if (true) {
            let empClass = new employeeClass(app.locals.connection, userID, restaurantID);


            return empClass.updateStaffInformation(staffInfo)
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function (err) {
                    //delegate to error handler
                    next(err);
                });

        } else {
            //construct response
            response.response = "form"; //set response message
            response.status = 200; //set status message
            response.msg = "Problem with update";

            // response.form = fInfo;

            //send response
            res.status(200);
            res.json(response);
        }



    })


    appRoutes.post('/deletestaffinfo', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let id = req.body.staff;

        let update = {
            _id: id,
            isActive: false
        }
        let response = FrontEndResponse.getNewFrontEndResponse();

        //after validations.will update later
        if (true) {
            let empClass = new employeeClass(app.locals.connection, userID, restaurantID);


            return empClass.updateStaffInformation(update)
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function (err) {
                    //delegate to error handler
                    next(err);
                });

        } else {
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

    appRoutes.post('/createstaffaccount', (req, res, next) => {
        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let staffInfo = req.body;

        let response = FrontEndResponse.getNewFrontEndResponse();

        //after validations.will update later
        if (true) {
            let empClass = new employeeClass(app.locals.connection, userID, restaurantID);


            return empClass.createStaffAccount(staffInfo)
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function (err) {
                    //delegate to error handler
                    next(err);
                });

        } else {
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

    appRoutes.post('/resetstaffpassword', (req, res, next) => {
        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let staffInfo = req.body;

        let response = FrontEndResponse.getNewFrontEndResponse();

        //after validations.will update later
        if (true) {
            let empClass = new employeeClass(app.locals.connection, userID, restaurantID);


            return empClass.resetStaffPassword(staffInfo)
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function (err) {
                    //delegate to error handler
                    next(err);
                });

        } else {
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

    appRoutes.post('/disablestaffaccount', (req, res, next) => {
        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let staffInfo = req.body;

        let response = FrontEndResponse.getNewFrontEndResponse();

        //after validations.will update later
        if (true) {
            let empClass = new employeeClass(app.locals.connection, userID, restaurantID);


            return empClass.updateStaffAccount(staffInfo, "disable")
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function (err) {
                    //delegate to error handler
                    next(err);
                });

        } else {
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

    appRoutes.post('/enablestaffaccount', (req, res, next) => {
        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let staffInfo = req.body;

        let response = FrontEndResponse.getNewFrontEndResponse();

        //after validations.will update later
        if (true) {
            let empClass = new employeeClass(app.locals.connection, userID, restaurantID);


            return empClass.updateStaffAccount(staffInfo, "enable")
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function (err) {
                    //delegate to error handler
                    next(err);
                });

        } else {
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


    //return router
    return appRoutes;

}