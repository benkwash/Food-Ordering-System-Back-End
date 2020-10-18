const customerclass = require('../../classes/customerOperations');
const Promise = require("bluebird");
const validate = require('../../functions/validate');
const FrontEndResponse = new(require("../../functions/serverResponseFormat"))();

//define routes for restaurant menu management
module.exports = function(app, express) {
    let appRoutes = express.Router();


    appRoutes.post('/getrestaurants', (req, res, next) => {

        let form = req.body;
        let region = form.region;
        let city = form.city;
        let pagneNumber = form.pageNumber;

        let option = form.option
            //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let custClass = new customerclass(app.locals.connection);

            return custClass.getRestaurants(region, city, pagneNumber, option)
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

    appRoutes.post('/getrestaurantmenu', (req, res, next) => {

        //retrieve userID and restaurant ID from request
        // let restaurantID = req.restaurantID;
        // let userID = req.userID;

        let form = req.body;
        let resID = form.resID;
        let city = form.city;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        if (true) {
            let custClass = new customerclass(app.locals.connection);

            return custClass.getAllRestaurantMenu(resID, city)
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

    return appRoutes;
}