//Define routes for management
module.exports = function(app, express) {
    let appRoutes = express.Router();

    // //-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
    // //-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
    // //BASIC STAFF OPERATIONS(FOR ALL STAFF)// ADMINS TOO

    //manage staff info
    const staffAuth = require("../middlewares/staff-authorization")(app, express, "staff");
    appRoutes.use("/staff", staffAuth);

    const staffOperations = require('./staff-portal')(app, express);
    appRoutes.use("/staff", staffOperations);


    //manage menu info
    const menuAuth = require("../middlewares/staff-authorization")(app, express, "menu");
    appRoutes.use("/menu", menuAuth);

    const menuOperations = require('./menu-portal')(app, express);
    appRoutes.use("/menu", menuOperations);


    //manage restaurant order
    const orderAuth = require("../middlewares/staff-authorization")(app, express, "orders");
    appRoutes.use("/order", orderAuth);

    const orderOperations = require('./order-portal')(app, express);
    appRoutes.use("/order", orderOperations);


    //manage restaurant deliveries
    const deliveryAuth = require("../middlewares/staff-authorization")(app, express, "delivery");
    appRoutes.use("/delivery", deliveryAuth);

    const deliveryOperations = require('./delivery-portal')(app, express);
    appRoutes.use("/delivery", deliveryOperations);


    //ratings and reviews
    const ratingAuth = require("../middlewares/staff-authorization")(app, express, "rating");
    appRoutes.use("/rating", ratingAuth);

    const ratingOperations = require('./rating-portal')(app, express);
    appRoutes.use("/rating", ratingOperations);


    //bills and revenue
    const accountsAuth = require("../middlewares/staff-authorization")(app, express, "accounts");
    appRoutes.use("/accounts", accountsAuth);

    const accountsOperations = require('./accounts-portal')(app, express);
    appRoutes.use("/accounts", accountsOperations);

    //return router
    return appRoutes;

}