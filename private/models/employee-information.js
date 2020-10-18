let mongoose = require('mongoose');

//export model
module.exports = function(connection) {

    //define schema
    let schema = mongoose.Schema;

    let telphoneSchema = new schema({
        number1: { type: String },
        number2: { type: String },
        number3: { type: String }
    }, { _id: false });

    let mods = new schema({
        date: { type: Date },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'USER_ACCOUNT_SETTINGS' },
        modifications: []
    })

    let permissions = new schema({
        staff: { type: Boolean },
        menu: { type: Boolean },
        accounts: { type: Boolean },
        orders: { type: Boolean },
        delivery: { type: Boolean },
        rating: { type: Boolean },
    })

    let employeeSchema = new schema({
        fName: { type: String },
        lName: { type: String },
        sex: { type: String },
        title: { type: String }, //accountant/cheff/waiter/admin/deliveryguy defined by admin or person adding staff
        employeeID: { type: String },
        permissions: permissions, //staff,menu,accounts,orders,delivery
        address: { type: String },
        email: { type: String },
        tel: telphoneSchema,
        qualification: { type: String },
        added: { type: Date, default: Date.now() },
        modifications: [mods],
        picture: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USER_ACCOUNT_SETTINGS', required: true },
        userID: { type: mongoose.Schema.Types.ObjectId, ref: 'USER_ACCOUNT_SETTINGS' }, //will be null if there is no account for this user
        restaurantID: { type: mongoose.Schema.Types.ObjectId, ref: 'RESTAURANT_INFO', required: true },
        isActive: { type: Boolean, default: true }, //when deleted this is set to falsse, not completely deleted..for minnig puproses ykwis
        isDeactivated: { type: Boolean, default: false } //when an admin deactivates a staff account(not delete)

    });

    return connection.model("EMPLOYEE_INFO", employeeSchema, "EMPLOYEE_INFO")

}