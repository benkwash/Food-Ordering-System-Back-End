 /* this module is the signup route..
  * this route deals with all links involving signing up...                                                                                                                            
  */
 const userAccountSettings = require('../classes/userAccountSettings');
 // const schoolinfo = require('../model-drivers/restaurant-Information');
 const _ = require('lodash');
 const tokenClass = require("../classes/tokenAuthentication");

 //frontend response format...
 FrontEndResponse = new(require("../functions/serverResponseFormat"))();

 //import validation function...
 const validate = require('../functions/validate');


 /*
 exports this function containing the routes....
 */
 module.exports = function(app, express) {

     //instance of the express router....
     router = express.Router();


     /**
      * ================
      *  EMAIL CHECK
      * ===============
      *  Check whether a provided email is being used by another user
      *  or not.
      */
     router.get('/signup/email', function(req, res, next) {
         //create a new response object
         let response = FrontEndResponse.getNewFrontEndResponse();
         let email = req.query.email ? req.query.email : "";

         formValid = (email == "") ? false : true;

         //formValid
         if (formValid) {
             //new user account settings class
             let newUser = new userAccountSettings(app.locals.connection);

             //check username
             newUser.emailExists(email)
                 .then(function(exists) {
                     response.data.fetched = { exists: exists };

                     //construct response
                     response.response = "okay";
                     response.status = 200;
                     res.status(200);
                     res.json(response);

                 }).catch(function(err) {
                     //delegate to error handler
                     next(err);
                 }); //end of authentication
         } else {
             //construct response
             response.response = "form";
             response.msg = "Invalid username";
             response.status = 200;

             res.status(200);
             res.json(response);
         }
     });

     /**
      * ===========================================
      *  SIGNUP CUSTOMER INFORMATION
      * ===========================================
      * Post sign up information
      * Validate fields,check for email uniqueness and if it passes, create user account
      * Reject if validation fails or email is already bein used.
      */
     router.post('/signUp', function(req, res, next) {
         //create a new response object
         let response = FrontEndResponse.getNewFrontEndResponse();

         let formValid = true;
         //form fields
         let form = {
             fName: { val: req.body.fName ? req.body.fName : false, error: "" },
             lName: { val: req.body.lName ? req.body.lName : false, error: "" },
             email: { val: req.body.email ? req.body.email : false, error: "" },
             accountType: { val: req.body.accountType ? req.body.accountType : false, error: "" },
             password: { val: req.body.password ? req.body.password : false, error: "" },
             passwordConfirm: { val: req.body.passwordConfirm ? req.body.passwordConfirm : false, error: "" },
             accountType: { val: req.body.accountType }
         };

         if (!form.fName.val || !validate.words(form.fName.val)) {
             formValid = false;
             form.fName.error = "A valid name is required";
         }
         if (!form.lName.val || !validate.words(form.lName.val)) {
             formValid = false;
             form.lName.error = "A valid name is required";
         }
         if (!form.email.val || !validate.email(form.email.val)) {
             formValid = false;
             form.email.error = "A valid name is required";
         }
         if (formValid && (!form.password.val || !validate.password(form.password.val))) {
             formValid = false;
             form.password.error = "A valid password is required";
         }
         if (formValid && !validate.passwordStrongEnough(form.password.val)) {
             formValid = false;
             form.password.error = "A minimum of eight characters and at least one uppercase letter, " +
                 "one lowercase letter and one number is required";
         }
         if (formValid && (form.password.val !== form.passwordConfirm.val)) {
             formValid = false;
             form.passwordConfirm.error = "Password mismatch";
         }
         if (!form.accountType.val) {
             formValid = false;
             form.accountType.error = "account type isn't specified";
         }
         if (formValid) {


             let temporalAccountInfo = {
                 fName: form.fName.val,
                 lName: form.lName.val,
                 email: form.email.val.trim().toLowerCase(), //remove white spaces and change to lowercase
                 accountType: form.accountType.val,
                 password: form.password.val,
                 accountType: form.accountType.val
             }

             //new user account settings class
             let newUser = new userAccountSettings(app.locals.connection);

             //first make sure email doesnot exist 
             //check email
             newUser.emailExists(temporalAccountInfo.email)
                 .then(function(exists) {
                     //only continue when email doesn't exist
                     if (!exists) {
                         //save a temporal admin info
                         newUser.signUpTemporalUser(temporalAccountInfo)
                             .then(function(results) {
                                 //construct response
                                 response.response = "okay";
                                 response.status = 200;

                                 response.data.fetched = results;

                                 //render response
                                 res.status(200);
                                 res.json(response);
                             });

                     } //end of username doesn't exist
                     else {
                         form.email.error = "Email exists"; //set new validation msg

                         //form becomse invalid if username exists
                         //validation failed
                         //construct response
                         response.response = "form";
                         response.msg = "Email already exists";
                         response.form = form;
                         response.status = 200;

                         res.status(200);
                         res.json(response);
                     } //end of username exists
                 }).catch(function(err) {
                     //delegate to error handler
                     next(err);
                 });
         } //end of form valid
         else {
             //validation failed
             //construct response
             response.status = 200;
             response.response = "form";
             response.msg = "Problem with sign up form";
             response.form = form;

             res.status(200);
             res.json(response);
         }
     });

     /**
      * ===========================================
      *  SIGNUP RESTAURANT INFORMATION
      * ===========================================
      * Post sign up information
      * Validate fields,check for email uniqueness and if it passes, create user account
      * Reject if validation fails or email is already bein used.
      */
     router.post('/vendor/signUp', function(req, res, next) {
         //create a new response object
         let response = FrontEndResponse.getNewFrontEndResponse();

         let formValid = true;
         //form fields
         let form = {
             fName: { val: req.body.name ? req.body.name : false, error: "" },
             email: { val: req.body.email ? req.body.email : false, error: "" },
             password: { val: req.body.password ? req.body.password : false, error: "" },
             passwordConfirm: { val: req.body.passwordConfirm ? req.body.passwordConfirm : false, error: "" },
         };

         if (!form.fName.val || !validate.words(form.fName.val)) {
             formValid = false;
             form.fName.error = "A valid name is required";
         }
         if (!form.email.val || !validate.email(form.email.val)) {
             formValid = false;
             form.email.error = "A valid name is required";
         }
         if (formValid && (!form.password.val || !validate.password(form.password.val))) {
             formValid = false;
             form.password.error = "A valid password is required";
         }
         if (formValid && !validate.passwordStrongEnough(form.password.val)) {
             formValid = false;
             form.password.error = "A minimum of eight characters and at least one uppercase letter, " +
                 "one lowercase letter and one number is required";
         }
         if (formValid && (form.password.val !== form.passwordConfirm.val)) {
             formValid = false;
             form.passwordConfirm.error = "Password mismatch";
         }

         if (formValid) {


             let temporalAccountInfo = {
                 fName: form.fName.val,
                 email: form.email.val.trim().toLowerCase(),
                 accountType: "admin",
                 password: form.password.val,
             }

             //new user account settings class
             let newUser = new userAccountSettings(app.locals.connection);

             //first make sure email doesnot exist 
             //check email
             newUser.emailExists(temporalAccountInfo.email)
                 .then(function(exists) {
                     //only continue when email doesn't exist
                     if (!exists) {
                         //save a temporal admin info
                         newUser.signUpTemporalUser(temporalAccountInfo)
                             .then(function(results) {
                                 //construct response
                                 response.response = "okay";
                                 response.status = 200;

                                 response.data.fetched = results;

                                 //render response
                                 res.status(200);
                                 res.json(response);
                             });

                     } //end of username doesn't exist
                     else {
                         form.email.error = "Email exists"; //set new validation msg

                         //form becomse invalid if username exists
                         //validation failed
                         //construct response
                         response.response = "form";
                         response.msg = "Email already exists";
                         response.form = form;
                         response.status = 200;

                         res.status(200);
                         res.json(response);
                     } //end of username exists
                 }).catch(function(err) {
                     //delegate to error handler
                     next(err);
                 });
         } //end of form valid
         else {
             //validation failed
             //construct response
             response.status = 200;
             response.response = "form";
             response.msg = "Problem with sign up form";
             response.form = form;

             res.status(200);
             res.json(response);
         }
     });

     /**
      * ====================================
      *  RESEND ACCOUNT VERIFICATION
      * ====================================
      */
     router.get('/resendverificationcode', (req, res, next) => {
         //retrieve form parameters
         let id = req.query.id ? req.query.id : "";

         //new frontend response
         let response = FrontEndResponse.getNewFrontEndResponse();

         if (validate.objectID(id)) {
             const userAcctInfoOp = new userAccountSettings(app.locals.connection);

             //resend verfication email
             userAcctInfoOp.resendVerificationInfo(id)
                 .then((results) => {
                     //construct response;
                     response.status = 200;
                     response.response = "okay";
                     response.data.fetched = results;

                     res.status(200);
                     res.json(response);
                 });
         } else {
             //construct response
             response.status = 200;
             response.response = "form";
             response.msg = "A valid information is required";

             res.status(200);
             res.json(response);
         }
     });

     /**
      * ==================================================
      *  VERIFY RESTAURANT EMAIL ACCOUNT
      * ==================================================
      */
     router.get("/vendor/verify", (req, res, next) => {
         //retrieve form parameters
         let id = req.query.id ? req.query.id : ""; //temporal account id
         let code = req.query.code ? req.query.code : ""; //verification code

         //new frontend response
         let response = FrontEndResponse.getNewFrontEndResponse();

         if (validate.objectID(id) && code) {
             const userAcctInfoOp = new userAccountSettings(app.locals.connection);

             //verify account info
             //and generate a token for the admin
             userAcctInfoOp.verifyAdminAccountInfo(id, code)
                 .then((results) => {
                     //results = {verified:status,accountInfo}
                     if (results.verified) {
                         let userAcctRes = results.accountInfo;

                         let Url = "restaurant";
                         let retAcctType = userAcctRes.accountType.toLowerCase();

                         //tokenOptions and payload
                         let payload = {
                             userID: userAcctRes.userID,
                             accountType: retAcctType,
                             restaurantID: userAcctRes.restaurantID ? userAcctRes.restaurantID : "",
                             url: Url
                         };
                         let tokenOptions = {}; //nothing for now

                         //set payload
                         let tokenAuth = new tokenClass();
                         tokenAuth.setPayload(payload, tokenOptions);

                         let bearerToken = tokenAuth.signToken(); //generate token

                         //construct response
                         response.response = "okay";
                         response.status = 200;
                         response.data.token = bearerToken;
                         response.data.path = retAcctType;
                         response.data.fetched = { verified: true };
                         response.data.other = {
                             url: Url
                         };

                     } else {
                         //construct response
                         response.response = "okay";
                         response.status = 200;
                         response.data.fetched = { verified: false };
                     }

                     //render response
                     res.status(200);
                     res.json(response);
                 });
         } else {
             //construct response
             response.status = 200;
             response.response = "form";
             response.msg = "A valid information is required";

             res.status(200);
             res.json(response);
         }
     });

     /**
      * ==================================================
      *  VERIFY USER EMAIL ACCOUNT
      * ==================================================
      */
     router.get("/customer/verify", (req, res, next) => {
         //retrieve form parameters
         let id = req.query.id ? req.query.id : ""; //temporal useraccountt id
         let code = req.query.code ? req.query.code : ""; //verification code

         //new frontend response
         let response = FrontEndResponse.getNewFrontEndResponse();

         if (validate.objectID(id) && code) {
             const userAcctInfoOp = new userAccountSettings(app.locals.connection);

             //verify account info
             //and generate a token for the admin
             userAcctInfoOp.verifyCustomerAccountInfo(id, code)
                 .then((results) => {
                     //results = {verified:status,accountInfo}
                     //  console.log(results);
                     if (results.verified) {
                         let userAcctRes = results.accountInfo;

                         let Url = "customer";
                         let retAcctType = userAcctRes.accountType.toLowerCase();

                         //tokenOptions and payload
                         let payload = {
                             userID: userAcctRes.userID,
                             accountType: retAcctType,
                             restaurantID: userAcctRes.restaurantID ? userAcctRes.restaurantID : "",
                             url: Url
                         };
                         let tokenOptions = {}; //nothing for now

                         //set payload
                         let tokenAuth = new tokenClass();
                         tokenAuth.setPayload(payload, tokenOptions);

                         let bearerToken = tokenAuth.signToken(); //generate token

                         //construct response
                         response.response = "okay";
                         response.status = 200;
                         response.data.token = bearerToken;
                         response.data.path = retAcctType;
                         response.data.fetched = { verified: true };
                         response.data.other = {
                             url: Url
                         };

                     } else {
                         //construct response
                         response.response = "okay";
                         response.status = 200;
                         response.data.fetched = { verified: false };
                     }

                     //render response
                     res.status(200);
                     res.json(response);
                 });
         } else {
             //construct response
             response.status = 200;
             response.response = "form";
             response.msg = "A valid information is required";

             res.status(200);
             res.json(response);
         }
     });
     //returns this router to be used in the main server....
     return router;
 }