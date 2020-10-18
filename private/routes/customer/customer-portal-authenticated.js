const customerclass = require('../../classes/customerOperations');
const _ = require('lodash');
const moment = require('moment');
const Promise = require("bluebird");
const validate = require('../../functions/validate');
const FrontEndResponse = new(require("../../functions/serverResponseFormat"))();

//define routes for restaurant menu management
module.exports = function(app, express) {
    let appRoutes = express.Router();


    appRoutes.post('/saveordercart', (req, res, next) => {
        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //retrieve userID
        let userID = req.userID;

        let form = req.body;

        if (form.mode == "pickup") {
            form.pickup = moment(form.pickup, 'kk:mm').format('lll');
        } else if (form.mode == "table") {
            form.table.time = moment(form.table.time, 'kk:mm').format('lll')
        }

        form.completed = {
            completed: false,
            time: null
        }
        form.customerConfirmation = false,
            form.deliveryPerson = {
                deliveryPerson: null,
                accountType: null
            }
        form.cancelled = {
            cancelled: false,
            by: "",
            reason: ""
        }
        form.processing = false
        form.review = {
            rating: null,
            comment: null,
            date: null,
            replies: []
        }




        //after validations..will update later
        if (true) {
            let custClass = new customerclass(app.locals.connection);

            return custClass.saveOrderCart(userID, form)
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
            response.msg = "";

            // response.form = fInfo;

            //send response
            res.status(200);
            res.json(response);

        }


    })


    appRoutes.get('/getcustomerorders', (req, res, next) => {

        //retrieve userID
        let userID = req.userID;

        let filter = req.query.filter
            //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();


        //after validations..will update later
        if (true) {
            let custClass = new customerclass(app.locals.connection);

            return custClass.getCustomerOrders(userID, filter)
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
            response.msg = "";

            // response.form = fInfo;

            //send response
            res.status(200);
            res.json(response);

        }


    })

    //getoneorderdetail
    appRoutes.get('/getoneorderdetail', (req, res, next) => {

        //retrieve userID
        let userID = req.userID;

        let id = req.query._id
            //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();


        //after validations..will update later
        if (true) {
            let custClass = new customerclass(app.locals.connection);

            return custClass.getOrderDetail(id)
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
            response.msg = "";

            // response.form = fInfo;

            //send response
            res.status(200);
            res.json(response);

        }


    })

    appRoutes.post('/updatecustomerorder', (req, res, next) => {

        //retrieve userID
        let userID = req.userID;

        let update = req.body;
        let cartID = update._id;

        let updateType = "updateCustomerOrder"
        if (!_.isNull(update.review)) updateType = "confirmOrder"

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();


        //after validations..will update later
        if (true) {
            let custClass = new customerclass(app.locals.connection);

            return custClass[updateType](cartID, update)
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
            response.msg = "";

            // response.form = fInfo;

            //send response
            res.status(200);
            res.json(response);

        }


    })

    ///sendreply
    appRoutes.post('/sendreply', (req, res, next) => {

        //retrieve userID
        let userID = req.userID;

        let reply = req.body;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();


        //after validations..will update later
        if (true) {
            let custClass = new customerclass(app.locals.connection);

            return custClass.sendReply(reply, userID)
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
            response.msg = "";

            // response.form = fInfo;

            //send response
            res.status(200);
            res.json(response);

        }


    })

    return appRoutes;
}