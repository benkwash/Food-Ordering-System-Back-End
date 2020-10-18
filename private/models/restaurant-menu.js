let mongoose = require('mongoose');

module.exports = function(connection) {

    //define promises
    mongoose.Promise = require('bluebird');

    let schema = mongoose.Schema;

    //define for contacts...
    let ingredients = new schema({
        name: { type: String },
        canBeIncreased: { type: Boolean },
        maximum: { type: Number },
        pricePerIncrement: { type: Number }

    });

    let feedback = new schema({
        userID: { type: mongoose.Schema.Types.ObjectId, ref: 'USER_ACCOUNT_SETTINGS' },
        comment: { type: String },
        rating: { type: Number },
        date: { type: Date, default: new Date }
    }, { _id: false });

    let options = new schema({
        name: { type: String },
        price: { type: Number }
    })
    let menu = new schema({
        restaurantID: { type: mongoose.Schema.Types.ObjectId, ref: 'RESTAURANT_INFO' },
        name: { type: String },
        description: { type: String },
        date: { type: Date, default: new Date() },
        ingredients: [ingredients],
        price: { type: Number },
        picture: { type: String },
        isActive: { type: Boolean, default: true },
        feedback: [feedback],
        options: [options] //some menu come with selectable different options...eg kfc streetwise comes with coke,fanta,sprite etc
    });

    //export this model....
    return connection.model('RESTAURANT_MENU', menu, 'RESTAURANT_MENU');
};