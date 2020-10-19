/*
 * This class serves as a driver for the 'user-account-settings' schema/Model
 * All the nitty-gritty database operations will be handled here
 */
var Promise = require("bluebird");
var mongoose = require('mongoose');

class UserAccountSettingsSchemaDriver {

    //constructor
    constructor(connection) {
        this.userSchema = null;
        this.temporalUserModel = null;

        //require the models
        this.setUserAccountSettingsSchema(connection);
        this.setTemporalUserAccountSettingsSchema(connection);
    }

    /**
     * This methods calls user-account-settings schema and assigns it to userSchema
     * @param {} - connection
     * @return {} - none
     */
    setUserAccountSettingsSchema(connection) {
        this.userSchema = require("../models/user-account-settings")(connection);
    }

    /**
     * Set the temporal user schema
     * @param {} - connection
     * @return {} - none
     */
    setTemporalUserAccountSettingsSchema(connection) {
        this.temporalUserModel = require("../models/temporal-user-account-settings")(connection);
    }

    /**
     * This method saves a user account information
     *  @param {Object} info - userInfo(object)
     *  @return {Promise} - promise(mongoose doc/error)
     */
    insertUserAccountInfo(info) {
        let saveInfo = new this.userSchema(info);

        return new Promise(function(resolve, reject) {
            saveInfo.save()
                .then(function(savedInfo) {
                    resolve(savedInfo);
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    }

    /**
     * This method saves a user account information into the temporal collection
     *  @param {Object} info - userInfo(object)
     *  @return {Promise} - promise(mongoose doc/error)
     */
    insertTemporalUserAccountInfo(info) {
        let saveInfo = new this.temporalUserModel(info);

        return new Promise(function(resolve, reject) {
            //save information.
            saveInfo.save()
                .then(function(savedInfo) {
                    resolve(savedInfo);
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    }

    /**
     * Retrieve the temporal user account information
     * @param {Object} id
     * @return {Promise}
     */
    getTemporalUserInformation(id) {
        let that = this;

        return new Promise((resolve, reject) => {
            //find the temporal user information using the provided id
            that.temporalUserModel.findOne({ _id: id }, {}, { lean: true }).exec()
                .then((results) => {
                    resolve(results);
                }).catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * Delete temporal user account information
     * @param {String} id
     * @return {Promise}
     */
    deleteTemporalUserInformation(id) {
        //execute without a callback
        return this.temporalUserModel.remove({ _id: id }).exec();
    }


    /**
     * This method queries the user-account-settings collections
     *  for a document given a user name
     *  @param {String} username 
     *  @return {Promise} - promise(mongoose doc/error)
     */
    checkUserName(username) {
            let that = this;
            let returned = { _id: 1 };

            //return a promise
            return new Promise(function(resolve, reject) {
                //fetch a user information
                //use a regular expression
                //should match exactly and be case insensitive
                //regex: ^username$ from begining to end(not part of username:whole match)
                let regex = "^" + username + "$";
                that.userSchema.findOne({ userName: RegExp(regex, 'i') }, returned).exec()
                    // that.userSchema.findOne({ userName: username }, returned).exec()
                    .then(function(userData) {
                        //resolve the promise with document
                        resolve(userData);
                    }).catch(function(error) {
                        //reject the promise with an error
                        reject(error);
                    });
            });
        } //end of method

    /**
     * This method queries the user-account-settings collections
     *  for a document given a user name
     *  @param {String} username 
     *  @return {Promise} - promise(mongoose doc/error)
     */
    checkEmail(email) {
            let that = this;
            let returned = { _id: 1 };

            //return a promise
            return new Promise(function(resolve, reject) {
                //fetch a user information
                //use a regular expression
                //should match exactly and be case insensitive
                //should be lowercase in order not to skip case sensitive email entered mistakenly
                let lEmail = email.toLowerCase();
                that.userSchema.findOne({ email: lEmail }, returned).exec()
                    .then(function(userData) {
                        //resolve the promise with document
                        resolve(userData);
                    }).catch(function(error) {
                        //reject the promise with an error
                        reject(error);
                    });
            });
        } //end of method


    /**
     * This method queries customer info using userID
     *  @param {String} userID 
     *  @return {Promise} - promise(mongoose doc/error)
     */
    retrieveCustomerName(userID) {
        let that = this;
        let returned = { fName: 1 };

        //return a promise
        return new Promise(function(resolve, reject) {
            //fetch a user information
            that.userSchema.findOne({ userID: userID }, returned).exec()
                .then(function(userData) {
                    //resolve the promise with document
                    resolve(userData);
                }).catch(function(error) {
                    //reject the promise with an error
                    reject(error);
                });
        });
    }

    /**
     * This method saves a user-account-settings information
     * @param {String} userID,
     * @param {Object} userInformation -userInfo(object)
     * @return {Promise} - promise(mongoose doc/error)
     */
    updateUserInformation(userID, userInformation) {
        let that = this;

        return new Promise(function(resolve, reject) {
            //find user's information using restaurantID and userID
            //and update recoveryoptions
            that.userSchema.findOneAndUpdate({
                    userID: userID,
                }, userInformation, {
                    new: true
                })
                .exec()
                .then(function(updatedInformation) {
                    //resolve the promise with the data
                    resolve(updatedInformation);
                }).catch(function(error) {
                    //reject the promise with an error
                    reject(error);
                });
        });
    }

    /**
     * This method queries the user-account-settings collections
     *  for a document given a userid and restaurantID
     * @param {String} userID
     * @param {String} restaurantID 
     * @return {Promise} - promise(mongoose doc/error)
     */
    retrieveUserInformation(userID, restaurantID) {
        let that = this;

        return new Promise(function(resolve, reject) {
            that.userSchema.findOne({
                    userID: userID,
                })
                .lean()
                .exec()
                .then(function(fetchedData) {
                    //resolve the promise with document
                    resolve(fetchedData);
                }).catch(function(error) {
                    //reject the promise if there's an error
                    reject(error);
                });
        });
    }

    /**
     * This method queries the user-account-settings collections
     *  for a document given a username
     *  @param {String} email 
     *  @return {Promise} - promise(mongoose doc/error)
     */
    getUserInformationUsingUsername(email) {
        let that = this;

        return new Promise(function(resolve, reject) {
            that.userSchema.findOne({ email: email }).lean().exec()
                .then(function(fetchedData) {
                    //resolve the promise with document
                    resolve(fetchedData);
                }).catch(function(error) {
                    //reject the promise if there's an erro
                    reject(error);
                });
        });
    }

    /**
     * This method saves a user-account-settings information 
     *  given username
     *  @param {String} userInformation -userInfo(object)
     *  @return {Promise} - promise(mongoose doc/error)
     */
    updateUserInformationUsingUsername(username, userInformation) {
        let that = this;

        return new Promise(function(resolve, reject) {
            that.userSchema.findOneAndUpdate({ email: username }, userInformation, { new: true }).exec()
                .then(function(updatedInformation) {
                    //resolve the promise with the data
                    resolve(updatedInformation);
                }).catch(function(error) {
                    //reject the promise with an error
                    resolve(error);
                });
        });
    }

    /** 
     * Update a user's password.
     * Before updating new password, push old password into old passwords
     * @param {String} userID
     * @param {String} newPassword
     * @param {String} restaurantID
     */
    updateUserPasswordInfo(userID, newPassword, restaurantID) {
        let that = this;

        return new Promise(function(resolve, reject) {
            //first retrieve the current existing password
            //and update the user's password: make new password current password
            //and push old password to oldPasswords.
            that.userSchema.findOne({ userID: userID }, { password: 1 }).exec()
                .then(function(res) {
                    if (res && res.password) {
                        //retrieve old passwords
                        let oldPassword = { password: res.password, date: Date.now() };

                        //update user account
                        //push old password into oldPassword
                        that.userSchema.update({ userID: userID }, {
                            password: newPassword,

                            //push old password
                            $push: { oldPasswords: oldPassword }
                        }).exec().then(function(res1) {
                            resolve(res1);
                        }).catch(function(err1) {
                            reject(err1)
                        }); //end of update operation
                    } //end of res password available 
                    else {
                        resolve(false);
                    }
                }).catch(function(err) {
                    reject(err);
                }); //end of fetch user password operation
        }); //end of new promise
    }


    /**
     * Create an account for a staff
     *  @param {Object} info -employee information
     *  @return {Promise} - promise(mongoose doc/error)
     */
    createEmployeeAccount(info) {
        let empInfo = info;
        empInfo['userID'] = mongoose.Types.ObjectId();
        let saveInfo = new this.userSchema(empInfo);

        return new Promise(function(resolve, reject) {
            saveInfo.save()
                .then(function(savedInfo) {
                    resolve(savedInfo);
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    }
}

//exports
module.exports = UserAccountSettingsSchemaDriver;