const UserAccountClass = require('../classes/userAccountSettings');
const validate = require('../functions/validate');
const FrontEndResponse = new(require("../functions/serverResponseFormat"))();
const Promise = require("bluebird");

// //export router
module.exports = function(app, express) {
    const router = express.Router();

    //     //ROUTES GO HERE

    //     /**
    //      * =======================
    //      *  CONFIRM USERNAME
    //      * =======================
    //      */
    router.get('/confirm_username', function(req, res, next) {
        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //retrieve params
        let username = req.query.username;

        //validate username/email
        let valid = validate.username(username) || validate.email(username);

        //continue if valid
        if (valid) {
            //instatiate userAccount class
            let userAccountOp = new UserAccountClass(app.locals.connection);

            //check if username exist
            userAccountOp.confirmUsername(username)
                .then(function(returned) {
                    //construct response
                    if (returned.exist) {
                        response.status = 200;
                        response.response = "okay";
                        response.data.fetched = returned;
                    } else {
                        //username/email does not exist

                        //construct response
                        response.status = 200;
                        response.response = "form";
                        let form = {
                            username: username,
                            usernameError: "Username/email does not exist"
                        }
                        response.form = form;
                    }

                    res.status(200);
                    res.json(response);
                }).catch(function(error) {
                    //throw error to error handler
                    next(error);
                });
        } else {
            //validation failed

            //construct response
            response.status = 200;
            response.response = "form";
            response.msg = "Invalid username. A valid username/email is required";

            res.status(200);
            res.json(response);
        }
    });

    /**
     * ==============================
     *  SEND RECOVERY CODE TO EMAIL
     * ==============================
     */
    router.post('/send_email_recoverycode', function(req, res, next) {
        //send recovery code tO email

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //retrieve body//username/useremail
        let username = req.body.username;
        let userEmail = req.body.userEmail;

        //VALIDATE email and username
        if (username && validate.email(userEmail)) {
            //holds validity of promise
            let isPromiseValid = true;

            //instatiate userAccount class
            let userAccount = new UserAccountClass(app.locals.connection);

            //send recovery code to the provided email
            userAccount.sendRecoveryCodeToMail(username, userEmail)
                .then(function(results) {
                    //results returns: {emailValid:bool,emailSent:bool}
                    if (results && results.emailValid) {
                        //construct response
                        response.status = 200;
                        response.response = "okay";
                        response.data.fetched = { emailSent: results.emailSent };
                    } else if (!results || !results.emailValid) {
                        //update the response to a form error
                        response.status = 200;
                        response.response = "form";
                        response.msg = "Email is not a recovery email.";
                    }

                    res.status(200)
                    res.json(response);
                }).catch(function(err) {
                    //delegate to global error handler
                    next(err);
                });
        } else {
            //form validation failed
            response.status = 200;
            response.response = "form";
            response.msg = !username ? "Invalid form" : "Invalid email";
            res.status(200);
            res.json(response);
        }
    });


    /**
     * =============================
     *  SUBMIT RECOVERY CODE
     * =============================
     */
    router.post('/submit_recoverycode', function(req, res, next) {
        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //retrieve body//username/useremail
        let username = req.body.username ? req.body.username : "";
        let recoveryCode = req.body.recoveryCode ? req.body.recoveryCode : "";

        //validate username && recovery code
        if (username && recoveryCode) {
            //instatiate userAccount class
            let userAccount = new UserAccountClass(app.locals.connection);

            userAccount.validateRecoveryCode(username, recoveryCode)
                .then(function(results) {
                    //results: {codeValid:bool,codeExpired:bool}
                    if (results) {
                        response.status = 200;
                        response.response = "okay";
                        response.data.fetched = {
                            valid: results.codeValid,
                            expired: results.codeExpired
                        };
                    }

                    res.status(200)
                    res.json(response);
                }).catch(function(error) {
                    //delegate to next error handler
                    next(error);
                });
        } else {

            //validation failed
            //construct response
            response.status = 200;
            response.response = "form";
            response.msg = "Invalid recovery code";

            res.status(200);
            res.json(response);
        }
    });

    /**
     * ========================================
     *  CHECK OLD PASSWORD EXISTENCE(VALIDITY)
     * ========================================
     */
    router.post('/check_old_password', function(req, res, next) {
        // Check if old provided password matches any of the user's old ones        

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //retrieve body//username/useremail
        let username = req.body.username ? req.body.username : "";
        let password = req.body.password ? req.body.password : "";

        if (username && validate.password(password)) {
            //instatiate userAccount class
            let userAccount = new UserAccountClass(app.locals.connection);

            //check if recover password exists in either current password or older passwords
            userAccount.checkRecoverPasswordValid(username, password)
                .then(function(passwordValid) {
                    //send response
                    response.status = 200;
                    response.response = "okay";
                    response.data.fetched = { valid: passwordValid ? true : false }

                    res.status(200);
                    res.json(response);
                }).catch(function(error) {
                    //delegate to error handler 
                    next(error);
                });
        } else {
            //construct response
            response.status = 200;
            response.response = "form";
            response.msg = !username ? "A valid form is required" : "A valid password is required";
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
        let response = FrontEndResponse.getNewFrontEndResponse()

        //get new password
        let username = req.body.username ? req.body.username : "";
        let newPassword = req.body.newPassword ? req.body.newPassword : false;

        //perform validations
        if (username && validate.password(newPassword)) {
            //instatiate userAccount class
            const userAccountOp = new UserAccountClass(app.locals.connection);

            //check if new password has been used
            let userID = null;
            userAccountOp.checkNewPasswordNotUsed(userID, newPassword, username)
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
     * ============================
     *  CHANGE A USER'S PASSWORD
     * ============================
     */
    router.post('/new_password', function(req, res, next) {
        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        let form = req.body;

        //new password form properties
        let newPassword = form.newPassword ? form.newPassword : "";
        let confirmNewPassword = form.confirmNewPassword ? form.confirmNewPassword : "";

        //validate fields
        //new password must exist,be valid and strong enough
        let validNewPassword = (newPassword && validate.password(newPassword) &&
            validate.passwordStrongEnough(newPassword)) ? true : false;

        //compare new password and confirmnewpassword
        let passwordsMatch = (form.newPassword == form.confirmNewPassword) ? true : false;

        //retrieve recovery form properties
        let recoveryForm = req.body.recovery ? req.body.recovery : {};

        //retrieve recovery fields
        let username = recoveryForm.username ? recoveryForm.username : "";
        let oldPasswordRecov = recoveryForm.oldPassword ? recoveryForm.oldPassword : "";
        let emailRecoveryCode = recoveryForm.emailRecoveryCode ? recoveryForm.emailRecoveryCode : "";

        //validate fields recovery options
        let recoveryFormValid = (username && (oldPasswordRecov || emailRecoveryCode)) ? true : false;

        //if valid
        if (validNewPassword && passwordsMatch && recoveryFormValid) {
            let recoveryInfoValid = true;
            let newPasswordValid = false;
            let promiseArray = [];
            let userID = null;
            let schoolID = null;

            //instatiate userAccount class
            let userAccountOp = new UserAccountClass(app.locals.connection);

            //old password is among recovery info
            if (oldPasswordRecov) {
                promiseArray.push(
                    //check if recover password exists in either current password or older passwords
                    userAccountOp.checkRecoverPasswordValid(username, oldPasswordRecov)
                    .then(function(passwordValid) {
                        //only set to false if validation failed else set to original val
                        recoveryInfoValid = !passwordValid ? false : recoveryInfoValid;
                    })
                );
            }

            //email recovery code available
            if (emailRecoveryCode) {
                //validate recovery code
                promiseArray.push(
                    userAccountOp.validateRecoveryCode(username, emailRecoveryCode)
                    .then(function(results) {
                        //only set to false if validation failed else set to original val
                        recoveryInfoValid = !results.codeValid ? false : recoveryInfoValid;
                    })
                );

            }

            //check if new password has been used
            promiseArray.push(
                //check if new password has been used
                userAccountOp.checkNewPasswordNotUsed(userID, newPassword, username)
                .then((valid) => {
                    newPasswordValid = valid;
                })
            );

            //also retrieve the userID using username
            promiseArray.push(
                userAccountOp.getUserID(username)
                .then((results) => {
                    if (results && results.userID) {
                        userID = results.userID;

                        //update the schoolID in the class
                        // userAccountOp.schoolID = schoolID;
                    }
                })
            );


            //execute al promise
            Promise.all(promiseArray).then((allResults) => {
                    if (recoveryInfoValid && newPasswordValid) {
                        //save new password with username
                        return userAccountOp.updateUserNewPassword(userID, newPassword);
                    } else {
                        //return a dummy false promise
                        return new Promise((resolve, reject) => {
                            resolve(false);
                        });
                    }
                })
                .then((finalResults) => {
                    if (recoveryInfoValid && newPasswordValid) {
                        //construct response
                        response.status = 200;
                        response.response = "okay";
                        response.data.fetched = finalResults;
                    } else if (!newPasswordValid) {
                        //construct response
                        response.status = 200;
                        response.response = "form";
                        response.msg = "Cannot use any old password as a new one";
                    } else {
                        //construct response
                        response.status = 200;
                        response.response = "form";
                        response.msg = "A valid recovery information is required";
                    }

                    res.status(200);
                    res.json(response);
                }).catch(function(error) {
                    //error
                    next(error);
                });
        } else {
            //validation failed error message
            let message = "";

            message = (!validNewPassword) ?
                "Invalid new password. A valid strong new password is required" : message;
            message = (validNewPassword && !passwordsMatch) ? "Passwords do not match" : message;
            message = (validNewPassword && passwordsMatch && !recoveryFormValid) ?
                "A valid recovery information is required" : message;

            //construct response
            response.status = 200;
            response.response = "form";
            response.form = form;
            response.msg = message;

            res.status(200);
            res.json(response);
        }
    });

    return router;
}