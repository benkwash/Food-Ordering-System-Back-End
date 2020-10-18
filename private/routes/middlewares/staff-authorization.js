let employee = require('../../classes/employeeOperations')

//export router
module.exports = function(app, express, permissionType) {
    router = express.Router();

    //Authenticate user
    router.use(function(req, res, next) {
        //get decoded information
        let decoded = req.decoded;

        //navigate here only if you're an admin or a staff

        //check if user is an admin
        if (decoded.accountType.toLowerCase() == "admin") {
            req.accountType="admin";
            //move to next matching router;
            next();
        } else if (decoded.accountType.toLowerCase() == "staff") {
            //if user is a staff, check if he/she has access to perform this operation
            let employeeClass = new employee(app.locals.connection, req.userID, req.restaurantID);

            return employeeClass.getStaffPermissions(permissionType)
                .then((hasPermission) => {
                    if (hasPermission) {
                        //move to next matching route
                        req.accountType="staff";
                        next();
                    } else {
                        //deny access;
                        res.redirect("/access_denied");
                    }
                })

        } else {
            //deny access;
            res.redirect("/access_denied");
        }
    }); //end of middleware

    //return router
    return router;
};