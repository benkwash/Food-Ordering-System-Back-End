const ratingclass = require('../../classes/ratingOperations');
const _ = require('lodash');
const moment = require('moment');
const Promise = require("bluebird");
const validate = require('../../functions/validate');
const FrontEndResponse = new(require("../../functions/serverResponseFormat"))();

//define routes for menu orders
module.exports = function(app, express) {
    let appRoutes = express.Router();



    //get restaurant rating details
    appRoutes.get('/getratingdetails', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        let ratingClass = new ratingclass(app.locals.connection, userID, restaurantID);

        return ratingClass.getResRating()
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

    //get restaurant reviews
    appRoutes.get('/getreviews', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        let ratingClass = new ratingclass(app.locals.connection, userID, restaurantID);

        return ratingClass.getReviews()
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

    //send review replies
    appRoutes.post('/sendreply', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let reply = req.body;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        let ratingClass = new ratingclass(app.locals.connection, userID, restaurantID);

        return ratingClass.sendReply(reply)
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

    return appRoutes;
}