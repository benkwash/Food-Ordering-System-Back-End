/*
 * This Class performs all password operations
 * Some operations include ( encrypting a password and comparing two passwords)
 * 30-07-2017
 */
var ServerLogger = require("./ServerLogger");

var bcrypt = require("bcryptjs");

class PasswordClass {
    //constructor
    constructor() {
        //define attributes
        this.bcrypt = null;
        this.originalPassword = null;
        this.hashedPassword = null;

        //require bcrypt API
        this.bcrypt = bcrypt;
    }

    /**
     * Set password fields (a plaintext pass and a hashedOne)
     * @param {String} - originalPassword 
     * @param {String} - hashedPassword(string/hashed)
     * @return {} - void
     */
    setPasswordFields(originalPassword, hashedPassword) {
        this.originalPassword = originalPassword;
        this.hashedPassword = hashedPassword;
    }


    /**
     * This method encrypts the original password(plain text) using bcrypt 
     * @param {String} password - plain text
     * @return {String} - encrypted password - string (synchronously)
     */
    encryptPassword(password) {
        //encrypt password
        //this is the work factor for the salt
        let salt = this.bcrypt.genSaltSync(10);

        //encrypt the plain unencrypted password
        return this.bcrypt.hashSync(password, salt);
    }

    /**
     * This method encrypts the original password(plain text) asynchronously
     * @param {String} password - plain text
     * @return {Callback} cb - encrypted password - string (asynchronously)
     */
    encryptPasswordAsync(password, cb) {
        //encrypt password
        //this is the work factor for the salt
        let salt = this.bcrypt.genSaltSync(10);

        this.bcrypt.hash(password, salt, null, function(err, hash) {
            if (error) {
                //error handler goes here
                ServerLogger.writeToLog(__filename, "encryptPasswordAsync", error);
                return cb(err, null);
            } else {
                return cb(null, hash);
            }
        });
    }

    /**
     * Compare two passwords using bcrypt synchronously
     * The plaintext and the hashed passwords
     * @param {String} plaintext - password
     * @param {String} hashedPassword - hashed
     * @return {Boolean} - boolean (synchronous)
     */
    compareTwoPasswords(plaintext, hashedPassword) {
        //compare hashed password with plain  password
        return this.bcrypt.compareSync(plaintext, hashedPassword);
    }

    /**
     * Compare two passwords using bcrypt asynchronously
     * The plaintext and the hashed passwords
     * @param {String} plaintext - password
     * @param {String} hashedPassword - hashed
     * @return {Callback(err,boolean)} - boolean (asynchronous)
     */
    compareTwoPasswordsAsync(plaintext, hashedPassword, callback) {
        //compare plain  password with hashed password
        this.bcrypt.compareSync(plaintext, hashedPassword, function(error, isMatched) {
            if (err) {
                //error handler goes here
                ServerLogger.writeToLog(__filename, "compareTwoPasswordsAsync", err);
                return callback(err, false);
            } else {
                return callback(null, isMatched);
            }
        });
    }

    /**
     * This method compares a given password with an array of encrypted passwords
     * Checks whether the new password is not used(does not exist) in the array of passwords
     * @param {String} newPassword - password
     * @param {Array} oldPasswords - hashed
     * @return {Boolean} passwordValidator - boolean (synchronous)
     */
    passwordNotInEncryptedArray(newPassword, oldPasswords) {
        let notExists = true;

        //ALGORITHM
        //loop through all passwords in array
        //compare the new password with each encrypted password
        //if password matches, it means it exists, break loop and return result

        if (Array.isArray(oldPasswords) && oldPasswords.length > 0) {

            //loop through old passwords and check if any matches with the newpassword
            for (let i in oldPasswords) {
                let valid = this.compareTwoPasswords(newPassword, oldPasswords[i].password);

                //if any matches, break out of loop
                if (valid) {
                    notExists = false;
                    break;
                }
            }
        }

        return notExists;
    }
} //end of class

//export class
module.exports = PasswordClass;