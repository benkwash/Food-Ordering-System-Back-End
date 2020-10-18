/*
 *==================================
 *  USER-ACCOUNT-SETTINGS SCHEMA
 *==================================
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

    //NOTE:
    //an admin has no userId, his/her userId is _id
    //however, all other created users student & staff will have ids and will be stored
    //in userID field

    //recovery options
    let recoveryOptions = new schema({
        email: { type: String },
        number: { type: String }
    }, { _id: false });

    //old passwords
    let oldPasswords = new schema({
        password: { type: String },
        date: { type: Date }
    }, { _id: false });

    //temporal recovery code sent via email/number
    let recoveryCode = new schema({
        code: { type: String },
        date: { type: Date }
    }, { _id: false })

    //main schema
    let userAcctSettings = new schema({
        fName: { type: String },
        lName: { type: String },
        email: { type: String },
        password: { type: String },
        isActive: { type: Boolean, default: true },
        accountType: { type: String }, //admin==restaurant,employee,customer
        recovery: recoveryOptions,
        oldPasswords: [oldPasswords],
        tempRecoveryCode: recoveryCode,
        userID: { type: mongoose.Schema.Types.ObjectId },
        restaurantID: { type: mongoose.Schema.Types.ObjectId, ref: 'RESTAURANT_INFO' }
    });

    //create indexes for schema
    userAcctSettings.index({ email: 1, schoolID: 1 });

    //check whether indexes are created
    //handle errors if indexes are not created
    //handle errors when there's an index creation error

    //export model
    return connection.model("USER_ACCOUNT_SETTINGS", userAcctSettings, "USER_ACCOUNT_SETTINGS");
}; //end of exports