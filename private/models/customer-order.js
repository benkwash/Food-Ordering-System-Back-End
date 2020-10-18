let mongoose = require('mongoose');

module.exports = function(connection) {

    //define promises
    mongoose.Promise = require('bluebird');

    let schema = mongoose.Schema;

    let ingredients = new schema({
        name: { type: String },
        quantity: { type: Number }

    }, { _id: false });


    let menu = new schema({
        menuID: { type: mongoose.Schema.Types.ObjectId, ref: 'RESTAURANT_MENU' },
        quantity: { type: Number },
        modified: { type: Boolean },
        ingredients: [ingredients],
        total: { type: Number }
    });

    //export this model....
    return connection.model('CUSTOMER_ORDER', menu, 'CUSTOMER_ORDER');
};