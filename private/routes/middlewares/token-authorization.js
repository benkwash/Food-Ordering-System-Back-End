// CHECK FOR THE EXISTENCE OF A TOKEN IN THE REQUEST AND AUTHENTICATE
// DENY ACCESS IF TOKEN DOESN'T EXIST OR IS INVALID
// DECODE TOKEN AND PASS TO NEXT ROUTER IF EVERYTHING WORKS FINE
var FrontEndResponse = new(require("../../functions/serverResponseFormat"))();
var tokenAuth = new(require('../../classes/tokenAuthentication'))(); //new instance

//export router
module.exports = function(app, express) {
    router = express.Router();
    var _ = require('lodash');

    /**
     * XSRF PROTECTION
     */
    router.use(function(req, res, next) {
        //XSRF Protection Strategy
        //Assert that all incoming requests to our API have the 
        //X-XSRF-TOKEN header, and that the value of the header is the token 
        //that is associated with the user’s provided token for the XSRF-TOKEN.
        //X-XSRF-TOKEN header should match the value in the XSRF-TOKEN cookie 
        //the frontend reads the cookie value and adds the header automatically.
        //This is to ensure that it's the app that's making the request since it's the only one
        //that can read the cookie in the browser for the domain and use it's value
        //another domain cannot read cookie for anothers.		
        //this token should be valid trusting that the request came from the user and the app only
        //not another site(becase only the frontend can read the javascript not another domain) 

        //NOTE: CSRF mostly occur on all mutating requests (POST,PUT,DELETE etc.) 
        //or on relative URLs(./something or ../something etc) 
        //but not on GET/HEAD requests or on requests with an absolute URL(starts with http:// or https://)
        //check if ur is an absolute path or relative
        //if protocol is defined as http or https, originalUrl should begin with / to be absolute		
        let isAbsolutePath = ((req.protocol == "http" || req.protocol == "https") &&
            req.originalUrl[0] == "/") ? true : false;


        if (req.method === "GET" || req.method === "HEAD" || isAbsolutePath) {
            //jump to the next matching router
            next();
        } else if (req.cookies && req.cookies["AITPROJECT-XSRF-TOKEN"] && req.headers["X-AITPROJECT-XSRF-TOKEN"]) {
            // let token_type = null;


            tokenAuth.setToken(req.cookies["AITPROJECT-XSRF-TOKEN"]);


            //decode token and process any errors
            tokenAuth.verifyToken()
                .then(function(xsrfDecoded) {
                    let cookieV = req.cookies["AITPROJECT-XSRF-TOKEN"];
                    let headerV = req.headers["X-AITPROJECT-XSRF-TOKEN"];

                    //cookie value should match req-headers-token value
                    if (xsrfDecoded && (cookieV === headerV)) {
                        //it's confirmed that the app sent the request
                        //move to next matching route
                        next();
                    } else {
                        //deny access;
                        res.redirect("/access_denied");
                    }
                })
                .catch(function(err) {
                    //error generated when token verification fails
                    //deny access;
                    res.redirect("/access_denied");
                });
        } else {
            //deny access;
            res.redirect("/access_denied");
        }
    });

    /**
     * User authentication(with token or cookie)
     */
    //Authenticate user
    router.use(function(req, res, next) {
        let token = null;

        //construct response
        let response = FrontEndResponse.getNewFrontEndResponse();

        //token could be from any any of the three (header,query,body)
        token = req.headers['authorization'] || req.query.token || req.body.token;
        token = (_.isUndefined(token) || _.isNull(token) || _.isEmpty(token)) ? "" : token;

        //NORMAL USER TOKEN AUTHENTICATION
        if (!token || token == "") {
            //check for the existence of a token in the cookie
            //if a token exist in cookie, return the token in the response
            //so that the client can use token to make requests everytime instead of using the cookie
            //COOKIE FROM THE MAIN APP(SCHOOL-MS) WILL BE EOSIT_SESSION_ID
            if (req.cookies && req.cookies.AITPROJECT_SESSION_ID) {
                //validate the session id
                tokenAuth.setToken(req.cookies.AITPROJECT_SESSION_ID);
                //decode token
                tokenAuth.verifyToken()
                    .then(function(decoded) {
                        //at least a userID and a school ID must be provided
                        if (decoded.userID && decoded.schoolID) {
                            //decoded information is returned 
                            //together with userID,restaurantID(for admins)
                            //store information in request
                            req.decoded = decoded;
                            req.userID = decoded.userID;
                            req.restaurantID = decoded.restaurantID ? decoded.restaurantID : "";

                            //add the cookie to a response header to be used subsequently
                            //headers will be intercepted by the app
                            //also add accountType and schoolUrl
                            res.header("X-AITPROJECT-ACCESS-TOKEN", req.cookies.EOSIT_SESSION_ID);
                            res.header("X-AITPROJECT-ROUTE-URL", decoded.url);
                            res.header("X-AITPROJECT-USER-TYPE", decoded.accountType);

                            //move to next matching router;
                            next();
                        } else {
                            //deny access;
                            res.redirect("/access_denied");
                        }
                    }).catch(function(err) {
                        //error generated when token verification fails
                        //deny access;
                        res.redirect("/access_denied");
                    });
            } else {
                //deny access;
                res.redirect("/access_denied");
            }
        } else if (token) {
            //decode token
            tokenAuth.setToken(token);

            //method returns a promise
            tokenAuth.verifyToken()
                .then(function(decoded) {
                    //at least a userID and a restaurant ID(for restuarant admin and staff) must be provided
                    let ver = (decoded.accountType == "customer") ? true : decoded.restaurantID;

                    if (decoded.userID && ver) {
                        //decoded information is returned 
                        //together with userID,schoolID(which is always needed)
                        //store information in request
                        req.decoded = decoded;
                        req.userID = decoded.userID;
                        req.restaurantID = decoded.restaurantID;

                        //move to next matching router;
                        next();
                    } else {
                        //deny access
                        //deny access;
                        res.redirect("/access_denied");
                    }
                }).catch(function(err) {
                    //error generated when token verification fails
                    //deny access;
                    res.redirect("/access_denied");
                });
        }
    }); //end of middleware

    //return router
    return router;
};