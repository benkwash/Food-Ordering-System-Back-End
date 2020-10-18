var path = require('path');
var tokenAuth = new(require("../classes/tokenAuthentication"))();

module.exports = function(app, express) {
    //define router
    let approuter = express.Router();

    //var functions = require("./private/functions/functionsClass.js");

    //cookie parser
    var cookieParser = require('cookie-parser');
    approuter.use(cookieParser());

    //body parser
    var bodyParser = require("body-parser");
    approuter.use(bodyParser.urlencoded({ extended: true }));
    approuter.use(bodyParser.json());

    let cors = require('cors');

    // after the code that uses bodyParser and other cool stuff
    // this is my front-end url for development
    //origins to be allowed
    const originsWhitelist = ['http://localhost:4200', 'http://localhost:5200'];


    let corsOptions = {
        origin: function(origin, callback) {
            var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
            callback(null, isWhitelisted);
        },
        credentials: true
    };

    //use cors
    approuter.use(cors(corsOptions));

    //ENABLE CORS and other settings
    approuter.use(function(req, res, next) {

        //retrieve the domain the request came from
        let origin = req.headers.origin;

        //since the "Access-Control-Allow-Origin" can only accept a single value,
        //check if req origin exists in array. use it if it exists
        //otherwise use the default 4200        
        let originExists = originsWhitelist.indexOf(origin) !== -1;

        if (originExists) {
            res.header("Access-Control-Allow-Origin", origin);
        } else {
            //redirect to access_denied later to block request from anonymous request
            res.header("Access-Control-Allow-Origin", originsWhitelist[0]);
        }

        //allow credentials(cookies)
        res.header("Access-Control-Allow-Credentials", "true");

        //control methods to be allowed
        res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");

        //allow headers
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With," +
            "Content-Type, Accept,AITPROJECT-XSRF-TOKEN");

        //headers to be exposed in response
        res.header("Access-Control-Expose-Headers", "X-AITPPROJECT-ACCESS-TOKEN, X-AITPROJECT-ROUTE-URL, X-AITPROJECT-USER-TYPE");


        /**
         * NOTE
         * To take advantage of this, your server needs to set a token in a 
         * JavaScript readable session cookie called XSRF-TOKEN on either the page 
         * load or the first GET request. On subsequent requests the server can verify 
         * that the cookie matches the X-XSRF-TOKEN HTTP header, and therefore be sure 
         * that only code running on your domain could have sent the request. 
         * The token must be unique for each user and must be verifiable by the server; 
         * this prevents the client from making up its own tokens. Set the token to a digest 
         * of your site's authentication cookie with a salt for added security.
         */
        //XSRF PROTECTION STRATEGY
        //create a EOSIT-XSRF-TOKEN | TEMPLATE-EOSIT-XSRF-TOKEN cookie to be used by 
        //frontend for XSRF Protection when request is made from either eosit.com or eosittemplate
        //XSRF TOKEN is associated with the user and is unique
        //set payload value(randomText will be needed during decoded)
        //request exist or is allowed
        if (originExists && (!req.cookies ||
                (req.cookies && (!req.cookies["AITPROJECT-XSRF-TOKEN"]))
            )) {
            //since no token cookie set,
            //generate a random xsrf token
            tokenAuth.generateRandomXSRFText()
                .then(function(randomValue) {
                    //setPayload: payload, tokenOptions
                    tokenAuth.setPayload(randomValue, {});
                    const anotherToken = tokenAuth.signToken(); //generate token

                    //cookie:no need to be secure(secure) or accessed only by the webserver(httpOnly)
                    //the client app needs to read from it. so it should be available
                    let cookieOptions1 = {
                        httpOnly: false,
                        secure: false,
                        path: '/'
                    };

                    //determine which cookie name to use or set
                    //set cookie based on the caller of the web app

                    res.cookie("AITPROJECT-XSRF-TOKEN", anotherToken, cookieOptions1);

                    next();

                }).catch(function(err) {
                    //delegate to error handler
                    next(err);
                });
        } else {
            next();
        }
    });

    return approuter;
}