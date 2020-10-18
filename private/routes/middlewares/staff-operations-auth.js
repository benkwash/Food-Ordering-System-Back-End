let employee = require('../../classes/employeeOperations')

//export router
module.exports = function(app, express, permissionType) {
    router = express.Router();

    //Authenticate staff
    router.use(function(req, res, next) {
        //get decoded information
        let decoded = req.decoded;

        //navigate here only if you're a staff

        //check if user is a staff
        if (decoded.accountType.toLowerCase() == "staff") {
            req.accountType = "staff";
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