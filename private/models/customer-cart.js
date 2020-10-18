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
        name: { type: String },
        ingredients: [ingredients],
        selectedOption: { type: String },
        quantity: { type: Number },
        price: { type: Number }
    });

    let cancelled = new schema({
        cancelled: { type: Boolean, default: false },
        by: { type: String }, //user or restaurant
        reason: { type: String } //reason for cancelling
    }, { _id: false });
    let table = new schema({
        tables: { type: Number },
        chairs: { type: Number },
        cost: { type: Number },
        time: { type: Date }
    }, { _id: false })

    let location = new schema({
        address: { type: String },
        number: { type: Number }
    }, { _id: false })

    let delivery = new schema({
        deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'USER_ACCOUNT_SETTINGS' },
        accountType: { type: String },

    }, { _id: false })

    let completed = new schema({
        completed: { type: Boolean, default: false }, // true if order has been pickedup,delivered or table has been occupied by customer,
        time: { type: Date }
    })

    let reply = new schema({
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'USER_ACCOUNT_SETTINGS' },
        date: { type: Date, default: new Date() },
        reply: { type: String }
    })

    let review = new schema({
        rating: { type: Number },
        comment: { type: String },
        date: { type: Date, default: new Date() },
        replies: [reply]
    }, { _id: false })


    let cart = new schema({
        restaurantID: { type: mongoose.Schema.Types.ObjectId, ref: 'RESTAURANT_INFO' },
        customerID: { type: mongoose.Schema.Types.ObjectId, ref: 'USER_ACCOUNT_SETTINGS' },
        orderID: { type: String },
        orders: [menu],
        deliveryFee: { type: Number },
        mode: { type: String }, //delivery, pickup,table
        deliveryPerson: delivery,
        table: table, //if reserved table,time the user will use the table.. u bab?
        pickup: { type: Date }, //if pickup, pickup time
        processing: { type: Boolean, default: false }, //if true ,orders are being processed..user cant cancel order
        completed: completed, //restaurant successfully delivers
        customerConfirmation: { type: Boolean, default: false },
        cancelled: cancelled,
        Date: { type: Date, default: new Date() },
        deliveryLocation: location,
        subtotal: { type: Number },
        total: { type: Number },
        review: review

    });

    //export this model....
    return connection.model('CUSTOMER_CART', cart, 'CUSTOMER_CART');
};