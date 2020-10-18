/*
 * Require necessary dependencies,frameworks and libraries:
 * Mongoose,bodyParser,express etc
 * Require the functions file.File has generic functions to be used in the app
 */
var express = require("express");

var app = express();

//create database connection and set to locals
app.locals.connection = require('./private/config/dbConnection');

/* =========================
 *  SERVER'S CONFIGURATIONS
 * =========================
 */
const config = require("./private/config/serverSettings")(app, express);
app.use(config);

/* ===================
 * Define all routes
 * ===================
 */
const routes = require("./private/routes/routes-definition")(app, express);
app.use(routes);

//HANDLE 404 requests
const notFoundRoutes = require("./private/allRoutesHandler");
app.all('*', notFoundRoutes);

//HANDLING ALL SERVER ERRORS
// THIS SHOULD BE DONE LAST
const errorHandlers = require("./private/errorHandler");

app.use(errorHandlers);



//Define localhost && port

const PORT = 3500;
const hostname = 'localhost';

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});