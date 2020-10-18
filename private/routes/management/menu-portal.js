const menuclass = require('../../classes/menuOperations');
const _ = require('lodash');
const moment = require('moment');
const Promise = require("bluebird");
const validate = require('../../functions/validate');
const FrontEndResponse = new (require("../../functions/serverResponseFormat"))();

//define routes for restaurant menu management
module.exports = function (app, express) {
    let appRoutes = express.Router();


    appRoutes.get('/getallmenu', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let menuClass = new menuclass(app.locals.connection, userID, restaurantID);

            return menuClass.getAllMenu()
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

    appRoutes.get('/getmenuinformation', (req, res, next) => {
        //retrive menu id
        let menuID = req.query.menuID ? req.query.menuID : "";

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        let menuClass = new menuclass(app.locals.connection);

        return menuClass.getOneMenu(menuID)
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

    })

    appRoutes.post('/savenewmenu', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let menu = req.body;
        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let menuClass = new menuclass(app.locals.connection, userID, restaurantID);

            return menuClass.saveMenu(menu)
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

    appRoutes.post('/updatemenu', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let menuUpdate = req.body;
        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let menuClass = new menuclass(app.locals.connection, userID, restaurantID);

            return menuClass.updateMenu(menuUpdate)
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

    appRoutes.post('/deletemenu', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        let restaurantID = req.restaurantID;
        let userID = req.userID;

        let menuID = req.body._id;
        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let menuClass = new menuclass(app.locals.connection, userID, restaurantID);

            return menuClass.deleteMenu(menuID)
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


    //return router
    return appRoutes;

}