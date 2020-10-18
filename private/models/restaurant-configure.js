let mongoose = require('mongoose');

module.exports = function (connection) {

    //define promises
    mongoose.Promise = require('bluebird');

    let schema = mongoose.Schema;

    //define for contacts...
    let location = new schema({
        city: { type: String },
        deliveryCost: { type: Number }
    });

    let rating = new schema({
        rating: { type: Number, default: 0 },
        outOf: { type: Number, default: 0 }
    })
    let configure = new schema({
        picture: { type: String },
        restaurantID: { type: mongoose.Schema.Types.ObjectId, ref: 'RESTAURANT_INFO' },
        cities: [location], //arroay[0] is the current location of the restaurant
        region: { type: String },
        pickup: { type: Boolean },
        delivery: { type: Boolean },
        tableReservation: { type: Boolean },
        totalTables: { type: Number }, //total number of reservable tables
        totalChairs: { type: Number }, //total number of reservable chairs
        maximumChairPerTable: { type: Number },
        costPerTable: { type: Number }, //cost to reserve table
        review: rating
    });

    //export this model....
    return connection.model('RESTAURANT_CONFIGURE', configure, 'RESTAURANT_CONFIGURE');
};