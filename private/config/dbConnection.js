/*
 * This script establishes a connection with our local mongoDB database
 * using mongoose driver and creating a connection object
 */
var mongoose = require("mongoose");

//define connection variables
var username = "benkwash";
var password = "developNow12";
var database = "food_ordering_system";

//create user
// db.createUser({
//     user: "benkwash",
//     pwd: "developNow12",
//     roles: [
//       { role: "readWrite", db: "food_ordering_system" },
//       { role: "dbAdmin", db: "food_ordering_system" },
  
//     ],
//     passwordDigestor: "server"
//   })

//localhost has the same address 127.0.0.1
var host = "127.0.0.1";
var port = "27017";

//mongoose expects uri: mongodb://
const oldConnectionURI = "mongodb://" + username + ":" + password + "@" + host + ":" + port + "/" + database;

// connection and options
var connection = null;
var options = {
    autoIndex: true, //build indexes by default
    // useMongoClient: true, //use the native mongodb client library
    keepAlive: true, //keep connections alive
    keepAliveInitialDelay: 300000, //ms to wait before initiating keepAlive on the socket
    connectTimeoutMS: 30000, //connection should timeout after 30 sec db op delay
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
};

try {
    //use the old connection uril
    connection = mongoose.createConnection(oldConnectionURI, options);
} catch (e) {
    console.log('error in establishing connection' + e);
}

//export router
module.exports = connection;