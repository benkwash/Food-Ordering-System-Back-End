let mongoose = require('mongoose');

module.exports = function(connection) {

    //define promises
    mongoose.Promise = require('bluebird');

    let schema = mongoose.Schema;

    //define for contacts...
    let tel = new schema({
        number1: { type: String },
        number2: { type: String },
        number3: { type: String },
        number4: { type: String },
        number5: { type: String }
    }, { _id: false });

    //define schema for schoolinfomation........
    let restaurantInfo = new schema({
        name: { type: String },
        location: { type: String },
        registeredDate: { type: Date, default: new Date() },
        contacts: tel,
        email: { type: String },
        website: { type: String }
    });

    //export this model....
    return connection.model('RESTAURANT_INFO', restaurantInfo, 'RESTAURANT_INFO');
};