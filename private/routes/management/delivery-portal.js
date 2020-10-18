const orderclass = require('../../classes/orderOperations');
const _ = require('lodash');
const moment = require('moment');
const Promise = require("bluebird");
const validate = require('../../functions/validate');
const FrontEndResponse = new(require("../../functions/serverResponseFormat"))();


//define routes for order deliveries
module.exports = function(app, express) {
    let appRoutes = express.Router();


     //get all delivery information
    appRoutes.get('/getdeliveryinformation', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;
        let accountType=req.accountType;

        let deliveryFilter=req.query.deliveryFilter;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let orderClass = new orderclass(app.locals.connection, userID, restaurantID);

            return orderClass.getRestaurantDeliveries(accountType,deliveryFilter)
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

    //updatedeliverstatus
    appRoutes.post('/updatedeliverstatus', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let cartInfo=req.body
        cartID=cartInfo._id;
        cartInfo=cartInfo.completed;
        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let orderClass = new orderclass(app.locals.connection, userID, restaurantID);

            return orderClass.updateDeliveryStatus(cartID,cartInfo.completed,cartInfo.time)
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