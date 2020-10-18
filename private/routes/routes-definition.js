var FrontEndResponse = new(require("../functions/serverResponseFormat"))();
var moment = require("moment");

//Define routes for application
module.exports = function(app, express) {
    let appRoutes = express.Router();



    //ACCESS DENIED TO SYSTEM
    //SHOULD COME FIRST(BEFORE ANYTHING ELSE)
    //to prevent redirect loop at token-authorization(if:token=="")
    appRoutes.use("/access_denied", function(req, res) {
        //construct response
        let response = FrontEndResponse.getNewFrontEndResponse();

        //construct response
        response.response = "error";
        response.msg = "Access Denied";
        response.status = 401;
        response.data.other = {};

        res.status(200);
        res.json(response);
    });


    //PASSWORD RECOVERY SECTION
    const forgotPassword = require('./forgot-password')(app, express);
    appRoutes.use('/account/recover', forgotPassword);

    // //SIGN-UP SECTION
    const signUp = require('./signUp')(app, express);
    appRoutes.use('', signUp);

    //SIGN-IN ROUTE
    const signIn = require("./signIn")(app, express);
    appRoutes.use(signIn);

    const customerRoute = require('./customer/customer-portal')(app, express);
    appRoutes.use('/unauthenticatedcustomer', customerRoute);


    //CLIENT-SIDE DEBUG INFO LOGGER
    const clientSideDebugLog = require("./clientAppDebugLogger")(app, express);
    appRoutes.use(clientSideDebugLog);

    //providing a response to server availability request
    //NOTE: useful during synchronization by the frontend
    appRoutes.use("/server/check", (req, res) => {
        //respond with an okay message indicating server is available

        //construct response
        let response = FrontEndResponse.getNewFrontEndResponse();

        response.response = "okay";
        response.msg = "";
        response.status = 200;
        response.data.other = {}
        response.data.fetched = { available: true };

        res.status(200);
        res.json(response);
    });




    //================================
    //TOP-LEVEL TOKEN AUTHENTICATION
    //================================
    const tokenAuth = require("./middlewares/token-authorization")(app, express);
    appRoutes.use(tokenAuth); //top-level


    //this route is just a dummy route
    //will be used by frontend to check if request contains cookes
    //response headers will contain the token and other info if no token was provided
    //but a cookie was instead provided. everthing will be handled in token authorization
    //since it's a middleware
    appRoutes.use("/access_check", function(req, res, next) {
        //everything would have been done by token-authorization and header set before it get's here
        //render a normal json
        res.json({});
    });

    // A general route for sending the user's id & restaurantid 
    //may be needed for any offline activity
    appRoutes.get("/user_credentials", function(req, res, next) {
        //construct response
        let response = FrontEndResponse.getNewFrontEndResponse();

        response.response = "okay";
        response.msg = "";
        response.status = 200;
        response.data.other = {}

        //return user's ID & schoolID
        response.data.fetched = { userID: req.userID, schoolID: req.schoolID };

        res.status(200);
        res.json(response);
    });


    //return a cookie for the authenticated user using bearer tokens
    appRoutes.get("/account/remember_me", (req, res, next) => {
        //user token is already valid, so just use it
        const bearerToken = req.headers['authorization'] || req.query.token || req.body.token;

        // set it in an HTTP Only and secure 
        //this cookie should expire in 6months
        let cookieOptions = {
            httpOnly: true,
            secure: false,
            path: '/',
            //add 6months from now
            expires: new Date(moment().add(6, 'M').toISOString())
        };

        //construct response
        let response = FrontEndResponse.getNewFrontEndResponse();

        response.response = "okay";
        response.msg = "";
        response.status = 200;

        //set cookie
        res.cookie("AITPROJECT_SESSION_ID", bearerToken, cookieOptions);

        //render response
        res.status(200);
        res.json(response);
    });

    //IMAGE UPLOADS ROUTES
    const uploads = require("./general_uploads")(app, express);
    appRoutes.use('/uploads', uploads);

    //USER ACCOUNT INFORMATION ROUTES
    const userAcct = require("./user-account")(app, express);
    appRoutes.use("/account", userAcct);

    //RETRIEVE CURRENT TIME(CORRECT TIME)
    appRoutes.get('/current_time', (req, res, next) => {
        //construct response
        let response = FrontEndResponse.getNewFrontEndResponse();

        response.response = "okay";
        response.msg = "";
        response.status = 200;
        response.data.other = {}

        response.data.fetched = new Date().toISOString();

        res.status(200);
        res.json(response);
    });

    const customerOperations = require('./customer/customer-portal-authenticated')(app, express);
    appRoutes.use('/customer', customerOperations);

    // // STAFF AND ADMIN OPERATIONS ROUTE(S)
    const managementOperations = require("./management/management-routes")(app, express);
    appRoutes.use("/manage", managementOperations);

    // staff routes authentication
    const staffMiddlewares = require("./middlewares/staff-operations-auth")(app, express);
    appRoutes.use("/staff", staffMiddlewares);

    // staff operations..only used by staff
    const staffOperations = require("./staff/staff-portal")(app, express);
    appRoutes.use("/staff", staffOperations);

    // -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
    // -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
    // ADMINISTRATOR OPERATONS

    // admin routes authentication
    const adminMiddlewares = require("./middlewares/admin-authorization")(app, express);
    appRoutes.use("/admin", adminMiddlewares);

    // //main admin operations //only admin is allowed here
    const adminOp = require("./admin/admin-portal")(app, express);
    appRoutes.use("/admin", adminOp);

    return appRoutes;
};