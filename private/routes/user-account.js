const UserAccountClass = require('../classes/userAccountSettings');
const validate = require('../functions/validate');
const FrontEndResponse = new(require("../functions/serverResponseFormat"))();
const Promise = require("bluebird");

//export router
module.exports = function(app, express) {
    const router = express.Router();



    router.get('/getcustomername', (req, res, next) => {
        let userID = req.userID;
        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //instatiate userAccount class
        let userAccount = new UserAccountClass(app.locals.connection);

        userAccount.getCustomerName(userID)
            .then(returned => {
                //construct response
                response.response = "okay"; //set response message
                response.status = 200; //set status message
                response.data.fetched = returned;


                //send response
                res.status(200);
                res.json(response);
            }).catch(function(error) {
                //delegate error to error handler
                next(error);
            });
    })

    /**
     * ======================================
     *  Retrieve recovery options for a user
     * ======================================
     */
    router.get('/recovery_options', function(req, res, next) {
        //retrieve userID and restaurantid
        let userID = req.userID;
        let restaurantID = req.restaurantID ? req.restaurantID : null;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //instatiate userAccount class
        let userAccount = new UserAccountClass(app.locals.connection, restaurantID);

        userAccount.retrieveRecoveryOptions(userID)
            .then(function(returnedData) {
                //construct response
                response.response = "okay"; //set response message
                response.status = 200; //set status message
                response.data.fetched = returnedData;


                //send response
                res.status(200);
                res.json(response);
            }).catch(function(error) {
                //delegate error to error handler
                next(error);
            });
    });

    /**
     * ==================================
     * Update a user's recovery options
     * ==================================
     */
    router.post('/recovery_options', function(req, res, next) {
        //retrieve userID
        let userID = req.userID;
        let restaurantID = req.restaurantID;

        //retrieve form
        let form = req.body;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //validate form if fields exist
        let validEmail = !form.email ? true : validate.email(form.email);
        let validNumber = !form.number ? true : validate.telephone(form.number);

        //at least one of the two has to be availabe or both
        if (validEmail && validNumber && (form.email || form.number)) {
            let finalForm = {
                recovery: {
                    email: form.email,
                    number: form.number
                }
            };

            //instatiate userAccount class
            let userAccount = new UserAccountClass(app.locals.connection, restaurantID);

            //update the user's recovery options
            userAccount.updateRecoveryOptions(userID, finalForm)
                .then(function(results) {

                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message
                    response.data.fetched = results;

                    //send response
                    res.status(200);
                    res.json(response);

                }).catch(function(error) {
                    //delegate error to error handler
                    next(error);
                });
        } else {
            //validation failed
            form.emailError = validEmail ? "" : "Provide a valid email";
            form.numberError = validNumber ? "" : "Provide a valid number";

            //construct response
            response.status = 200;
            response.response = "form";
            response.msg = "Problem with form submission";
            response.form = form;

            //at least one of the form has to be present
            if (!form.email && !form.number) {
                response.msg = "At least one of the recovery options is required.";
            }

            res.status(200);
            res.json(response);
        }
    });


    /**
     * ===========================================
     * Compare old user's password with saved one
     * ===========================================
     */
    router.post('/check_password', function(req, res, next) {
        //retrieve form/user data
        let userID = req.userID;
        let restaurantID = req.restaurantID ? req.restaurantID : null;
        let form = req.body;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //validate fields
        let validOldPassword = validate.password(form.oldPassword);

        if (validOldPassword) {
            //instatiate userAccount class
            let userAccount = new UserAccountClass(app.locals.connection, restaurantID);

            //check whether curent password is correct
            userAccount.checkCurrentPassword(userID, form.oldPassword)
                .then(function(validPassword) {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message

                    response.data.fetched = { validPassword: validPassword };

                    //send response
                    res.status(200);
                    res.json(response);
                }).catch(function(error) {
                    //delegate error to error handler
                    next(error);
                });
        } else {
            //construct response
            response.status = 200;
            response.response = "form";
            response.msg = "A valid password is required";
            response.form = form;

            res.status(200);
            res.json(response);
        }
    });

    /**
     * ===================================================
     *  CHECK IF USER'S NEW PASSWORD ALREADY EXISTS(USED)
     * ===================================================
     */
    router.post("/check_newpassword", (req, res, next) => {
        //CHECK IF THE PROVIDED USER NEW PASSWORD HAS NOT BEEN USED
        let restaurantID = req.restaurantID ? req.restaurantID : null;
        let userID = req.userID;
        let userType = req.userType;
        let response = FrontEndResponse.getNewFrontEndResponse()

        //get new password
        let newPassword = req.body.newPassword ? req.body.newPassword : false;

        if (validate.password(newPassword)) {
            //instatiate userAccount class
            const userAccountOp = new UserAccountClass(app.locals.connection, restaurantID);

            //check if new password has been used
            userAccountOp.checkNewPasswordNotUsed(userID, newPassword)
                .then((results) => {
                    //results:boolean

                    //construct response
                    response.status = 200;
                    response.response = "okay";
                    response.data.fetched = {
                        //negate password not used.
                        //original (true => not exist, false=>exist)
                        //negated (true => exist, false=>not exist)                        
                        exists: !results
                    };

                    res.status(200);
                    res.json(response);
                }).catch(function(error) {
                    //delegate error to error handler
                    next(error);
                });
        } else {
            //validation failed
            response.response = "form";
            response.status = 200;
            response.msg = "A valid new password is required";

            res.status(200);
            res.json(response);
        }
    });

    /**
     * ==================================
     * CHANGE A USER'S CURRENT PASSWORD
     * ==================================
     */
    router.post('/change_password', function(req, res, next) {
        //retrieve form/user data
        let userID = req.userID;
        let restaurantID = req.restaurantID ? req.restaurantID : null;
        let form = req.body;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //form properties
        let oldPassword = form.oldPassword ? form.oldPassword : "";
        let newPassword = form.newPassword ? form.newPassword : "";
        let confirmNewPassword = form.confirmNewPassword ? form.confirmNewPassword : "";

        //validate fields
        let validOldPassword = oldPassword && validate.password(oldPassword) ? true : false;

        //new password must exist,be valid and strong enough
        //new password must also not be the same as the old password
        let validNewPassword = (newPassword && validate.password(newPassword) &&
            validate.passwordStrongEnough(newPassword)) ? true : false;
        let newPassSameAsOldValid = (oldPassword != newPassword) ? true : false;

        //compare new password and confirmnewpassword
        let passwordsMatch = (form.newPassword == form.confirmNewPassword) ? true : false;

        if (validOldPassword && validNewPassword && passwordsMatch && newPassSameAsOldValid) {
            //instatiate userAccount class
            const userAccount = new UserAccountClass(app.locals.connection, restaurantID);

            //change user password
            userAccount.changeUserPassword(userID, oldPassword, newPassword)
                .then((results) => {
                    //results returns 
                    //{oldPasswordValid:bool,newPasswordValid:bool,isSaved:bool};
                    if (!results.oldPasswordValid) {
                        response.msg = "Incorrect old password";
                    }

                    //if old password is valid and new isn't valid
                    if (results.oldPasswordValid && !results.newPasswordValid) {
                        response.msg = "Cannot use any old password as a new one";
                    }

                    //construct response
                    response.status = 200;
                    response.response = (results.oldPasswordValid && results.newPasswordValid) ?
                        "okay" : "form";
                    response.data.fetched = results;

                    res.status(200);
                    res.json(response);
                }).catch(function(error) {
                    //delegate error to error handler
                    next(error);
                });
        } else {
            //validation failed error message
            let message = "";

            message = !validOldPassword ? "Invalid Old Password" : "";
            message = (validOldPassword && !validNewPassword) ?
                "Invalid new password. A valid strong new password is required" : message;
            message = (validOldPassword && validNewPassword && !newPassSameAsOldValid) ?
                "New password cannot be the current one" : message;
            message = (validOldPassword && validNewPassword &&
                    newPassSameAsOldValid && !passwordsMatch) ?
                "Passwords do not match" : message;

            //construct response
            response.status = 200;
            response.response = "form";
            response.form = form;
            response.msg = message;

            res.status(200);
            res.json(response);
        }
    });

    /**
     * ========================================================
     * Block/unblock(revoke access or grant access) (to) a user
     * ========================================================
     * This route is only accessible by restaurant administrators
     */
    //first use the middleware to validate the user to ensure it's an admin before continuing
    const adminMiddlewares = require("./middlewares/admin-authorization")(app, express);
    router.use("/user", adminMiddlewares);

    router.post('/user', (req, res, next) => {
        //retrieve form/user data
        let userID = req.userID;
        let restaurantID = req.restaurantID;

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //validate user to blocked or granted access.
        const userToChangeID = req.body.userID ? req.body.userID : "";
        const blockUser = (req.body.blockUser && req.body.blockUser == "t") ? true : false;

        //form properties
        if (validate.objectID(userToChangeID)) {
            //instatiate userAccount class
            const userAccount = new UserAccountClass(app.locals.connection, restaurantID);

            //construct userInfo to update
            //if block user(true), isActive is false. if unblock user(false), isActive is true.
            const toBeUpdated = { isActive: !blockUser };

            //udpate user's account information
            userAccount.updateUserAccountInformation(userToChangeID, toBeUpdated)
                .then((results) => {
                    //construct response
                    response.response = "okay"; //set response message
                    response.status = 200; //set status message
                    response.data.fetched = results;

                    res.status(200);
                    res.json(response);
                }).catch(function(error) {
                    //delegate error to error handler
                    next(error);
                });
        } else {
            //return a form error
            //validation failed error messages
            //construct response
            response.status = 200;
            response.response = "form";
            response.msg = "Invalid user information";
            response.form = form;

            res.status(200);
            res.json(response);
        }
    });

    return router;
}; //end of exports