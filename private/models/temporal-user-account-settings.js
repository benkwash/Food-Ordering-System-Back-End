/*
 *=========================================
 *  TEMPORAL-USER-ACCOUNT-SETTINGS SCHEMA
 *=========================================
 * This is the user-account schema.
 * Every user account operations are stored in the db using this schema.
 */
module.exports = function(connection) {
    //require necessary variables
    let mongoose = require('mongoose');

    //define promises
    mongoose.Promise = require('bluebird');

    //define schema
    let schema = mongoose.Schema;

    //main schema
    let temporalUserAcctSettings = new schema({
        fName: { type: String },
        lName: { type: String },
        email: { type: String },
        password: { type: String },
        accountType: { type: String }, //admin,employee,customer
        confirmationCode: { type: String },
        codeIssuedDate: { type: Date, default: new Date() },
        hasConfirmedAccount: { type: Boolean, default: false }
    });

    //export model
    return connection.model("TEMPORAL_USER_ACCOUNT_SETTINGS", temporalUserAcctSettings,
        "TEMPORAL_USER_ACCOUNT_SETTINGS");
}; //end of exports