//export router
module.exports = function(app, express) {
    router = express.Router();

    //Authenticate user
    router.use(function(req, res, next) {
        //get decoded information
        let decoded = req.decoded;

        //navigate here only if you're an admin

        //check if user is an admin
        if (decoded.accountType.toLowerCase() == "admin") {
            //move to next matching router;
            next();
        } else {
            //deny access;
            res.redirect("/access_denied");
        }
    }); //end of middleware

    //return router
    return router;
};