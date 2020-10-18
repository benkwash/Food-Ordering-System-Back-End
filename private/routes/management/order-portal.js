const orderclass = require('../../classes/orderOperations');
const _ = require('lodash');
const moment = require('moment');
const Promise = require("bluebird");
const validate = require('../../functions/validate');
const FrontEndResponse = new(require("../../functions/serverResponseFormat"))();

//define routes for menu orders
module.exports = function(app, express) {
    let appRoutes = express.Router();


    //get one order details
    appRoutes.get('/getorderdetails', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let orderID = req.query.orderID;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();


        let orderClass = new orderclass(app.locals.connection, userID, restaurantID);

        return orderClass.getOneOrderDetail(orderID)
            .then((returned) => {
                //construct response
                response.response = "okay"; //set response message
                response.status = 200; //set status message

                //set response data field
                response.data.fetched = returned;

                //send response
                res.status(200);
                res.json(response);
            }).catch(function(err) {
                //delegate to error handler
                next(err);
            });




    })

    //restaurantorders
    appRoutes.get('/restaurantorders', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let orderClass = new orderclass(app.locals.connection, userID, restaurantID);

            return orderClass.getRestaurantOrders()
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function(err) {
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

    //restaurantorders
    appRoutes.get('/restaurantordersfilter', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;
        let orderOption = req.query.orderOption;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let orderClass = new orderclass(app.locals.connection, userID, restaurantID);

            return orderClass.getRestaurantOrdersFilter(orderOption)
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function(err) {
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

    //process order
    appRoutes.post('/processorder', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let cartID = req.body.orderID;
        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let orderClass = new orderclass(app.locals.connection, userID, restaurantID);

            return orderClass.processOrder(cartID)
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function(err) {
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

    //getdeliverystaff
    appRoutes.get('/getdeliverystaff', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let orderClass = new orderclass(app.locals.connection, userID, restaurantID);

            return orderClass.getDeliveryStaff()
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function(err) {
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


    //assigndeliverystaff
    appRoutes.post('/assigndeliverystaff', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let form = req.body;
        let cartID = form.cartID;
        let staffID = ""
        let accountType = form.accountType
        let deliverMyself = form.deliverMyself
        if (deliverMyself) {
            staffID = userID
        } else {
            staffID = form.staffID
        }

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let orderClass = new orderclass(app.locals.connection, userID, restaurantID);

            return orderClass.assignDeliveryStaff(cartID, staffID, accountType)
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function(err) {
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

    appRoutes.post('/cancelorder', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let form = req.body;
        let cartID = form.cartID;
        let by = form.cancelledBy;
        let reason = form.cancelReason ? form.cancelReason : "";



        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let orderClass = new orderclass(app.locals.connection, userID, restaurantID);

            return orderClass.cancelOrder(cartID, by, reason)
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function(err) {
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


    appRoutes.post('/updateorderstatus', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let form = req.body;
        let cartID = form.cartID;

        let completed = form.completed;
        let time = form.time;



        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let orderClass = new orderclass(app.locals.connection, userID, restaurantID);

            return orderClass.updateDeliveryStatus(cartID, completed, time)
                .then((returned) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    //set response data field
                    response.data.fetched = returned;

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function(err) {
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


    //return router
    return appRoutes;
}