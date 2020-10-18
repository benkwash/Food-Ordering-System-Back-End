const _ = require('lodash');
const moment = require('moment');
const passwordGenerator = require("password-generator");
const validate = require('./validate');

class FuntionClass {


    static generateUserName(userType) {
        //use the current date+ other libraries to 
        //generate a unique username

        //for now username should be datetime
        //yyy-mm-dd-hh-mm-ss
        let tempUsername = moment(new Date()).format("YYYY-MM-DD-HH-mm-ss");

        //don't include the first character (year char). only the last three (yyy) matter
        //eg: 2014->014, 2020->020, 2150-> 150 etc
        tempUsername[0] = "";

        return tempUsername;
    }

    /**
     * @see https://www.npmjs.com/package/password-generator for password generation methods
     * Generated password should be strong enough to pass password validation
     */
    static generateRawPassword() {
        //generate a minimum 8 length nonmemorable password which satisfies conditions
        //as a caveat: loop should not exceed 200 times(why infinite loop ?)
        let password = "";
        let loopCount = 0;

        while (!validate.passwordStrongEnough(password)) {
            password = passwordGenerator(8, false, /\w/);

            loopCount += 1;

            //break just in case;
            if (loopCount > 200) break;
        }

        return password;
    }

    //order ID for all orders....capping the first 10 charaters of mongodb object id.
    returnOrderID(cartID) {
        return cartID.toString().substring(0, 10); //order id ==first 10 characters of mongo obj id
    }

}

module.exports = FuntionClass;