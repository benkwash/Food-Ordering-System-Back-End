_ = require("lodash");
var moment = require('moment');

module.exports = {
    isString(param) {
        return (_.isString(param));
    },
    isNull(value) {
        return (_.isNull(value));
    },
    isBoolean(value) {
        return _.isBoolean(value);
    },
    isEmpty(value) {
        return _.isEmpty(value);
    },
    isNumber(value) {
        return _.isNumber(value);
    },
    isArray(param) {
        return _.isArray(param);
    },
    passBasicValidation(val, min = 0, max = 50) {
        //input should be a string
        //string should be within the character range
        //string should not include some provided special characters

        //special forbidden characters: <>!~`%^\*{}\[\]
        return (this.isString(val) && val.length >= min && val.length <= max &&
            !val.match(/[<>~`^\{\}\[\]]/)) ? true : false;
    },
    word(val, min = 0, max = 50) {
        //word should not contain a space, new line, tab, carriage return
        return (this.passBasicValidation(val, min, max) && !val.match(/[\s\n\r\t]/)) ? true : false;
    },
    objectID(id) {
        //validate object id:(hexademic string) 12 or 24 in length
        return (this.isString(id) && id.match(/^[0-9a-fA-F]{24}$/)) ? true : false;
    },
    words(val, min = 0, max = 100) {
        //pass basic validation and accept a space(s) with more characters than the default
        //words should not contain new line, tab or carriage return		
        return (this.passBasicValidation(val, min, max) && !val.match(/[\n\r\t]/))
    },
    text(val, min = 0, max = 1000) {
        //by default a maximum of 1000 characters is required.
        //pass basic validation and accept a space(s),new line, tab, returns etc.
        return this.passBasicValidation(val, min, max);
    },
    password(password) {
        //normal password validation should be for any given word
        return this.word(password, 1);
    },
    passwordStrongEnough(password) {
        if (this.isString(password)) {
            // Minimum eight characters, at least one uppercase letter, one lowercase letter and one number:
            // return !!(password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9@$!%*#?&-_]{8,}$/));

            //it doesn't have to be from the beginning. match anywhere
            //at least a number,uppercase,lowercase & 8min characters are needed(whatever the rest are)
            return !!(password.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d){8,}/));
        } else {
            return false;
        }
    },
    email(email) {
        if (this.isString(email)) {
            //html provides that functionality for us
            return (email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) ? true : false;
        } else {
            return false;
        }
    },
    username(val, min = 0, max = 50) {
        //use word validation
        return this.word(val, min, max);
    },
    number(number) {
        return _.isNumber(value);
    },
    telephone(value) {
        //validates a telephone number
        // numbers,hypen or ().
        // eg:(054)-6837194 or (054)-683-7194 or 054-6837194 or 0546837194, etc

        //return a simple number validation for now
        return (this.isString(value) && value.match(/^[0-9-\(\)\+\s]{10,}$/)) ? true : false;
    },
    image(imageName) {
        //only images should pass
        return (this.isString(imageName) && imageName.match(/\.(png|jpg|jpeg|JPG|PNG|JPEG)$/)) ? true : false;
    },
    amount(value) {
        //should be either a number or a string with numbers
        //convert to string and validate
        // let stringV = _.isString(value) ? value: _.toString(value);
        //matches any number that is or not followed by a decimal point
        // return (stringV.match(/^\d+(?!\.)|\d+(?=\.\d{2})$/)) ? true:false;
        return (this.isNumber(value) && value > 0) ? true : false;
    },
    currency(value) {
        //should be a valid and recognized currency
        let allowed = defaultTypes.currencyTypes();
        let exists = false;

        //loop through types
        for (let i = 0; i < allowed.length; i++) {
            if (value == allowed[i]) {
                exists = true;
                break;
            }
        }
        return exists;
    },
    date: function(date) {
        //known format for submission yyyy-mm-dd from the browser 
        return moment(date, ["YYYY-MM-DD", "YYYY-M-DD", "YYYY-MM-D", "YYYY-M-D"], true).isValid();
    }
}; //exports