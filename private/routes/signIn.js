var UserAccountClass = require('../classes/userAccountSettings');
var validate = require('../functions/validate');
var FrontEndResponse = new(require("../functions/serverResponseFormat"))();
var TokenAuthClass = require("../classes/tokenAuthentication");
var moment = require("moment");

var empClass=require('../classes/employeeOperations')

//export router
module.exports = function(app, express) {
    var router = express.Router();

    /**
     * ================
     *   LOGIN 
     * =================
     * Submit user sign up form for processing.
     */
    router.post('/signIn', function(req, res, next) {
        //Main app/school-template-config - school-ms app signIn
        //Submit user sign up form
        //Retrieve password for username and check for password match
        //Return a new token+ path and other relevent data

        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //get form fields and construct response
        //also remember to set cookies when user wants to be remembered
        let loginForm = {
            email: { value: ((req.body.email) ? req.body.email : false), error: "", valid: true },
            password: { value: ((req.body.password) ? req.body.password : false), error: "", valid: true },
            rememberMe: { value: ((req.body.rememberMe && req.body.rememberMe == 't') ? true : false), error: "", valid: true }
        };

        //perform form validations
        if (validate.email(loginForm.email.value) || validate.username(loginForm.email.value)) {} else {
            loginForm.email.valid = false;
            loginForm.email.error = "A valid email/username is required";

        }
        if (!loginForm.password.value || !validate.password(loginForm.password.value)) {
            loginForm.password.valid = false;
            loginForm.password.error = "A valid password is required";
        }

        //check
        if (loginForm.email.valid && loginForm.password.valid) {
            //require and use userAccountClass
            let UserAccount = new UserAccountClass(app.locals.connection);

            //set fields
            let info = {
                email: loginForm.email.value.trim(), //email shouldnt be case sensitive
                password: loginForm.password.value.trim()
            };

            //authenticate user
            //callbacks: isAuthenticated, userId, accountType, schoolID
            UserAccount.authenticateUser(info)
                .then(function(retObject) {
                    //token auth class
                    let tokenAuth = new TokenAuthClass();

                    //properties of obj are:
                    //isAuth,userID,accountType,schoolID
                    if (retObject && !retObject.isAuth) {
                        //username || password was incorrect
                        //set messages
                        loginForm.password.valid = false;
                        loginForm.password.error = "Incorrect email/username or password";

                        //construct response
                        response.form = loginForm;
                        response.response = "form";
                        response.msg = "Incorrect email/username or password";
                        response.status = 200;
                    } else if (retObject && retObject.isAuth) {

                        let url = (retObject.accountType != "customer") ? "restaurant" : "customer";
                        let retAcctType = retObject.accountType.toLowerCase();

                        //tokenOptions and payload
                        let payload = {
                            userID: retObject.userID,
                            accountType: retAcctType,
                            restaurantID: retObject.restaurantID ? retObject.restaurantID : "",
                            url: url
                        };

                        let tokenOptions = {}; //nothing for now

                        //set payload
                        tokenAuth.setPayload(payload, tokenOptions);

                        let bearerToken = tokenAuth.signToken(); //generate token

                        //construct response
                        response.response = "okay";
                        response.status = 200;
                        response.data.token = bearerToken;
                        response.data.other = {
                            userID: retObject.userID,
                            restaurantID: retObject.restaurantID ? retObject.restaurantID : "",
                            url: url
                        };

                        //get path to be used by front end app
                        //redirect to teacher's portal if user is a supervisor or teacher
                        //and accountant portal is user is an accountant
                        //or student's portal if user is a student
                        //or an admin's portal if user is an admin
                        //otherwise(for other staff), redirect to the basic staff-portal
                        if (retAcctType == "customer")
                            response.data.path = "customer";
                        else if (retAcctType == "admin")
                            response.data.path = "admin";
                        else {
                            response.data.path = "staff";
                            response.data.other['staffPermissions']=retObject.staffPermissions;
                        }

                        //rememberMe value is set or true ?
                        if (loginForm.rememberMe.value) {
                            //set signed cookies to be used.
                            // set it in an HTTP Only + on only secure connections.
                            let cookieOptions = {
                                httpOnly: true,
                                secure: false,
                                path: '/',
                                //add 6months from now
                                expires: new Date(moment().add(6, 'M').toISOString())
                            };

                            //set cookie
                            res.cookie("AITPROJECT_SESSION_ID", bearerToken, cookieOptions);
                        }
                    } //end of else (retObject.isAuth)

                    //render response
                    res.status(200);
                    res.json(response);
                }).catch(function(err) {
                    //delegate to error handler
                    next(err);
                }); //end of authentication
        } else {
            //invalid form data
            //construct response json
            response.response = "form";
            response.status = 200;
            response.msg = "problem with sign in form.";
            response.form = loginForm;

            //render response
            res.status(200);
            res.json(response);
        }
    }); //end of route

    /**
     * ===============
     *  LOG USER OUT
     * ==============
     */
    router.get('/logout', function(req, res, next) {
        //REMOVE USER COOKIE IF AVAILABLE
        //cookie should be backdated to last year
        //subtract time i.e 1 year from the current date.
        //an old token is expired and no longer used and will be deleted by the browser.
        let cookieOptions = {
            httpOnly: true,
            secure: false,
            path: '/',
            expires: new Date(moment().subtract(1, 'y').toISOString()) //subtract 1 year
        };

        tokenBearer = "";

        //remove any of the main app's cookie and the template-config-app cookie
        res.cookie("AITPROJECT_SESSION_ID", tokenBearer, cookieOptions);

        //REMOVE XSRF-TOKEN COOKIE TOO(XSRF PROTECTION STRATEGY)
        let anotherToken = "";
        let cookieOptions1 = {
            httpOnly: false,
            secure: false,
            path: '/',
            expires: new Date(moment().subtract(1, 'y').toISOString()) //subtract 1 year
        };
        res.cookie("AITPROJECT-XSRF-TOKEN", anotherToken, cookieOptions1);

        //render nothing;
        res.json({});
    });

    return router;
}; //end of exports