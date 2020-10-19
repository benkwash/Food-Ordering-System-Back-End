/*
 * Wisy This class performs all user account related operations
 * Operations - authenticating user,updating records etc
 
 * Ben -This module is a class for the first part of the signup process
 * whcih uses the user schema..
 * There are different methods performing specific operations
 * such as updating,viewing,blocking or creating a new user....
 */
const _ = require("lodash");

const ServerLogger = require("./ServerLogger");
const Promise = require("bluebird");
const userAccountDriver = require("../model-drivers/user-account-settings");
const restaurantInfoDriver = require("../model-drivers/restaurant-Information");
const passwordClass = require("./password.js");
const validate = require('../functions/validate');
const mailClass = new(require('./mailClass'))();
const codeGenerator = require('../functions/generateRandomCode');
const moment = require("moment");
const empClass = require('./employeeOperations')

class UserAccountSettings {
    //by default restaurantID should be null to prevent other methods
    //already using userAccountSettings from flagging an error
    constructor(connection, restaurantID = null) {
        //declare attributes for this  class
        // var userSchema;
        this.userAccountDriver = null;
        this.jsonData = null;
        this.passwordObj = null;
        this.connection = connection;
        this.userSchema = null;
        this.restaurantInfoDriver = null;
        this.restaurantID = restaurantID;

        //set the account user schema
        this.setUserAccountDriver(connection);
    }


    /** 
     * Require user account  model-driver
     * @param {} - none
     * @return {} - none
     */
    setUserAccountDriver(connection) {
        if (!this.userAccountDriver) {
            this.userAccountDriver = new userAccountDriver(this.connection);
        }
        this.userSchema = require("../models/user-account-settings")(connection);
    }

    /**
     * Require school info model driver
     * @param {} - none
     * @return {} - none
     */
    setrestaurantInfoDriver() {
        //only set driver once
        if (!this.restaurantInfoDriver) {
            this.restaurantInfoDriver = new restaurantInfoDriver(this.connection);
        }
    }

    /**
     * Require password class
     * @param {} - none
     * @return {} - none
     */
    setPasswordClass() {
        //only set driver once
        if (!this.passwordObj) {
            this.passwordObj = new passwordClass();
        }
    }

    /**
     * Create a new password object
     * @param {} - hashed password
     * @return {} - none
     */
    setPasswordObj(hashedPassword) {
        //require password class
        this.setPasswordClass();

        //set password fields
        this.passwordObj.setPasswordFields(this.jsonData.password, hashedPassword);
    }

    /**
     * Authenticate a user given a email/username and a password
     *  @param {Object} info - userData=>object which contains(email/username and password attr)
     *  @return {Promise} - promise
     */
    authenticateUser(info) {
            let that = this;

            //require password class
            this.setPasswordClass();

            let obj = { isAuth: false, userID: null, accountType: null, restaurantID: null, staffPermissions: null };
            let isStaff = false; //used to check if the user is a staff or not
            return this.userAccountDriver.getUserInformationUsingUsername(info.email)
                .then(function(data) {
                    //data should be available
                    if (!_.isEmpty(data) && !_.isNull(data)) {
                        //compare passwords(password in json vs password from the db)
                        let correct = that.passwordObj.compareTwoPasswords(info.password, data.password);

                        if (correct && data.isActive) {
                            obj.isAuth = true;
                            obj.userID = _.toString(data.userID);
                            obj.accountType = data.accountType;
                            obj.restaurantID = data.restaurantID ? _.toString(data.restaurantID) : "";
                        }
                        if (data.accountType == "staff") {
                            isStaff = true;
                            let employeeClass = new empClass(that.connection, data.userID, data.restaurantID);
                            return employeeClass.getAllStaffPermissions()
                        } else {
                            return true
                        }
                    }

                }).then((data) => {

                    if (!_.isEmpty(data) && !_.isNull(data) || data == true) {
                        if (isStaff) {
                            obj.staffPermissions = data; //staff permissions
                        }
                    }
                    return obj;
                })
        } //end of method

    /**
     * Authenticate a user given a schooID,userID and a password
     * @param {String} restaurantID
     * @param {String} userID
     * @param {String} password
     * @return {Promise} - promise
     */
    authenticateUserUsingOtherInfo(restaurantID, userID, password) {
            let that = this;

            //require password class
            this.setPasswordClass();

            let obj = { isAuth: false, userID: null, accountType: null, restaurantID: null };

            return this.userAccountDriver.retrieveUserInformation(userID, restaurantID)
                .then(function(data) {
                    //data should be available
                    if (!_.isEmpty(data) && !_.isNull(data)) {

                        //compare passwords(password in json vs password from the db)
                        let correct = that.passwordObj.compareTwoPasswords(password, data.password);

                        if (correct && data.isActive) {
                            obj.isAuth = true;
                            obj.userID = _.toString(data.userID);
                            obj.accountType = data.accountType;
                            obj.restaurantID = _.toString(data.restaurantID);
                        }
                    }

                    //return object
                    return obj;
                });
        } //end of method


    /* This method creates a new user....
     * It receives a json file and a callback as it parameters..
     * The json file(info) is then passed into a mongoose method which creates a user...
     * The callback function is run after the create operation is succesful
     * which passes the newly created document in a json format to a callback function.
     */
    createUser(info, callback) {
        let that = this;
        //require password class
        that.setPasswordClass();

        //encrypt password and set to password
        info.password = this.passwordObj.encryptPassword(info.password);


        var saveInfo = new this.userSchema(info);
        saveInfo.save().
        then(function(savedInfo) {
            console.log('log from newuser' + savedInfo);
            callback(savedInfo);
        }).
        catch(function(err) {
            //write to log
            ServerLogger.writeToLog(__filename, "createUser", err);
            console.log(err);
        });

    }

    /**
     * Check whether the provided username exists or is being used by another person
     * Promise returns a boolean when successful or an error on failure
     * @param {String} username - username:string
     * @return {Promise(success(boolean),error)} - (success(true|false),error())
     */
    userNameExists(username) {
            let that = this;
            //find by username
            return this.userAccountDriver.checkUserName(username)
                .then(function(results) {
                    //a null results indicates that the username is available for use
                    //or isn't used by another user.
                    return (_.isNull(results) || _.isEmpty(results)) ? false : true;
                });
        } //end of method


    /**
     * Check whether the provided email exists or is being used by another person
     * Promise returns a boolean when successful or an error on failure
     * @param {String} username - username:string
     * @return {Promise(success(boolean),error)} - (success(true|false),error())
     * 08-08-2017
     */
    emailExists(email) {
            let that = this;

            //find by username
            return this.userAccountDriver.checkEmail(email)
                .then(function(results) {
                    //a null results indicates that the username is available for use
                    //or isn't used by another user.
                    return (_.isNull(results) || _.isEmpty(results)) ? false : true;
                });
        } //end of method


    /**
     * NOTE:
     * SIGNUP-GOES INTO THE TEMPORAL USER ACCOUNT COLLECTION
     * Sign a new restaurant/customer up
     * Into the temporal user account settings collection
     * @param {Object} temporalAccountInfo - object{accounttype fName,mName,lName}
     * @return {Promise} 
     */
    signUpTemporalUser(temporalAccountInfo) {
        let that = this;

        //require password class
        this.setPasswordClass();

        //encrypt password and set to password
        temporalAccountInfo.password = this.passwordObj.encryptPassword(temporalAccountInfo.password);

        //ALGORITHM
        //GENERATE A CODE AND ADD  AS THE CONFIRMATION CODE
        //SAVE THE TEMPORAL ADMIN INFO INTO TEMPORAL COLLECTION WITH THE GENERATED CODE
        //SEND THE CODE TO THE USER'S EMAIL

        let tempUserID = null,
            generatedCode = null;
        let userEmail = temporalAccountInfo.email;

        return codeGenerator.generateCode()
            .then((code) => {

                generatedCode = code;

                //add generated code to userAccount info
                temporalAccountInfo["confirmationCode"] = code;
                temporalAccountInfo["codeIssuedDate"] = new Date();

                //insert the temporal user information
                return that.userAccountDriver.insertTemporalUserAccountInfo(temporalAccountInfo);
            })
            .then(function(results) {
                //temporal user id
                tempUserID = results._id;

                if (tempUserID && generatedCode) {
                    //send account verfication mail function
                    return mailClass.sendAccountVerificationMail(userEmail, generatedCode);
                } else {
                    //this should also return a promise
                    return new Promise(function(resolve, reject) {
                        resolve(false);
                    });
                }
            })
            .then((mailSent) => {
                return { isSaved: true, emailSent: mailSent ? true : false, userID: tempUserID };
            });
    }

    /**
     * Sign a new school up with the administrator's information
     * @param {Object} adminSchoolInfo - object{admin fName,mName,lName}
     * @param {Object} userAccountInfo - object{username,password,...}
     * @return {Promise} 
     */
    signNewUserUp(adminSchoolInfo, userAccountInfo) {
        let that = this;

        //require password class
        this.setPasswordClass();
        this.setrestaurantInfoDriver();

        //encrypt password and set to password
        userAccountInfo.password = this.passwordObj.encryptPassword(userAccountInfo.password);

        let info = { adminInfo: [adminSchoolInfo] };

        //insert schoolAdmin info first.
        //retreive school Id, add to userAccountInfo and insert user account Info
        return this.restaurantInfoDriver.insertSchoolInfo(info)
            .then(function(savedInfo) {
                //retrieve id
                //append info to userAccount
                userAccountInfo["restaurantID"] = savedInfo._id;

                //get userID generated after inserted admin name
                userAccountInfo["userID"] = savedInfo.adminInfo[0]._id;

                //now insert user-account information
                return that.userAccountDriver.insertUserAccountInfo(userAccountInfo)
                    .then(function(results) {
                        return results
                    });
            });
    }


    /**
     * Resend temporal admin verfication account info
     * @param {String} id
     * @return {Promise}
     */
    resendVerificationInfo(id) {
        let that = this;
        this.setrestaurantInfoDriver();

        //retrieve the temporal admin information
        //retrieve the code and resend the verification code
        return this.userAccountDriver.getTemporalUserInformation(id)
            .then((results) => {
                //document
                if (results) {
                    let userEmail = results.email;
                    let generatedCode = results.confirmationCode;

                    //send account verfication mail function
                    return mailClass.sendAccountVerificationMail(userEmail, generatedCode);
                } else {
                    //this should also return a promise
                    return new Promise(function(resolve, reject) {
                        resolve(false);
                    });
                }
            })
            .then((mailSent) => {
                return { emailSent: mailSent ? true : false };
            });
    }


    /**
     * Verify an admin/restaurant account account
     * @param {String} id
     * @param {String} code
     * @return {Promise}
     */
    verifyAdminAccountInfo(id, code) {
        let that = this;
        this.setrestaurantInfoDriver();

        //retrieve the temporal user account information
        return this.userAccountDriver.getTemporalUserInformation(id)
            .then((results) => {
                let finalResults = { verified: false, accountInfo: null };

                //compare code
                //if code matches, save the admin school info,user account setting
                //remove the temporal account info
                //if code fails, return failed verfication
                if (code === results.confirmationCode) {
                    finalResults.verified = true;

                    //retrieve restaurant's info
                    let restaurantInfo = { name: results.fName } //fname==restaurant name..from signup
                    let acctInfo = {
                        fName: results.fName,
                        email: results.email,
                        password: results.password,
                        isActive: true,
                        accountType: results.accountType,
                        restaurantID: "",
                        userID: results._id
                    }

                    //insert restaurant name first.
                    //retreive restaurant Id, add to userAccountInfo and insert user account Info
                    return that.restaurantInfoDriver.insertRestaurantInfo(restaurantInfo)
                        .then(function(savedInfo) {

                            //append info to adminAcctInfo
                            acctInfo.restaurantID = savedInfo._id;

                            //delete the temporal account information
                            that.userAccountDriver.deleteTemporalUserInformation(id);

                            //now insert rrestaurant account details in user-account information
                            return that.userAccountDriver.insertUserAccountInfo(acctInfo)
                        })
                        .then((insertedResults) => {
                            finalResults.accountInfo = insertedResults;

                            return finalResults;
                        });

                } else {
                    //return the final results.
                    return finalResults;
                }
            }); //end of temporal user info.
    }


    /**
     * Verify customer account info
     * @param {String} code
     * @return {Promise}
     */
    verifyCustomerAccountInfo(id, code) {
        let that = this;

        //retrieve the temporal user account information
        return this.userAccountDriver.getTemporalUserInformation(id)
            .then((results) => {
                let finalResults = { verified: false, accountInfo: null };

                //compare code
                //if code matches, save the admin school info,user account setting
                //remove the temporal account info
                //if code fails, return failed verfication
                if (code === results.confirmationCode) {
                    finalResults.verified = true;

                    //retrieve the admin info //(is an array)
                    let acctInfo = {
                        fName: results.fName,
                        lName: results.lName,
                        email: results.email,
                        password: results.password,
                        isActive: true,
                        accountType: results.accountType,
                        userID: results._id
                    }


                    //now insert user-account information
                    return that.userAccountDriver.insertUserAccountInfo(acctInfo)
                        .then((insertedResults) => {

                            //delete the temporal account information
                            that.userAccountDriver.deleteTemporalUserInformation(id);
                            finalResults.accountInfo = insertedResults;

                            return finalResults;
                        });
                } else {
                    //return the final results.
                    return finalResults;
                }
            }); //end of temporal user info.
    }

    /**
     * Update/insert user account recovery information 
     * @param {String} userID
     * @param {Object} userInformation - object{userid,email,number..}
     * @return {Promise} -promise(recovery information)
     */
    updateRecoveryOptions(userID, userInformation) {
        let that = this;

        //update user information.
        return this.userAccountDriver
            .updateUserInformation(userID, userInformation)
            .then(function(updatedInformation) {
                return { isUpdated: updatedInformation ? true : false };
            });
    }

    /**
     * Retrieve user account recovery information 
     * @param {String} userID
     * @return {Promise} -promise(recovery information)
     */
    retrieveRecoveryOptions(userID) {
        //retrieve the recovery options
        return this.userAccountDriver.retrieveUserInformation(userID, this.restaurantID)
            .then(function(retrievedData) {
                //construct data to be returned
                let fetched = { email: "", number: "" };

                //check if recovery options exist.
                if (retrievedData.recovery) {
                    let recovery = retrievedData.recovery;
                    fetched.email = recovery.email ? recovery.email : "";
                    fetched.number = recovery.number ? recovery.number : "";
                }

                //return results
                return fetched;
            });
    }

    /**
     * Check if old password given by user matches current password in database
     * @param {String} userID
     * @param {String} oldPassword - old password
     * @return {Promise(success(boolean),error)} - (success(true|false),error())
     */
    checkCurrentPassword(userID, oldPassword) {
        let that = this;

        //require password class
        this.setPasswordClass();

        //fetch user information
        return this.userAccountDriver.retrieveUserInformation(userID, this.restaurantID)
            .then(function(fetchedData) {
                //define current password
                let fetchedPassword = fetchedData.password;

                //compare current password with given passsword
                let samePassword = that.passwordObj.compareTwoPasswords(oldPassword, fetchedPassword);

                //returns bool...true, if passwords match
                return samePassword;
            });
    }

    /**
     * Change a user's password
     * @param {String} userID
     * @param {String} oldPassword
     * @param {String} newPassword
     * @return {Promise<oldPasswordValid:false,newPasswordValid:false,isSaved:false>}
     */
    changeUserPassword(userID, oldPassword, newPassword) {
        //check current(old password) if correct
        //also check if new password  has not been used.
        //if both are valid,then update new password
        let that = this;

        //returned fields
        let returnedRes = { oldPasswordValid: false, newPasswordValid: false, isSaved: false };

        //check current password if correct
        const oldPassProm = this.checkCurrentPassword(userID, oldPassword);

        //check if the new password has not been used.
        const newPassProm = this.checkNewPasswordNotUsed(userID, newPassword);

        //to prevent synchronous exec time, let's execute both operations concurrently
        return Promise.all([oldPassProm, newPassProm]).then((allResponse) => {
                //check if valid old password
                if (allResponse[0]) {
                    returnedRes.oldPasswordValid = true;
                } else {
                    returnedRes.oldPasswordValid = false;
                }

                //check if the new password is valid(is not an old password)
                if (allResponse[1]) {
                    returnedRes.newPasswordValid = true;
                } else {
                    returnedRes.newPasswordValid = false;
                }

                if (allResponse[0] && allResponse[1]) {
                    //update the user password with the new one
                    return that.updateUserNewPassword(userID, newPassword);
                } else {
                    //return a dummy promise
                    return new Promise((resolve, reject) => { resolve(false); });
                }
            })
            .then((finalRes) => {
                if (finalRes) {
                    returnedRes.isSaved = true;
                } else {
                    returnedRes.isSaved = false;
                }

                return returnedRes;
            });
    }

    /**
     * Check if new password is not used in any of the old passwords in database
     * Check using either the userID and restaurantID or username
     * @param {String} userID
     * @param {String} newPassword  
     * @param {String} username  - null by default  
     * @return {Promise(success(boolean),error)} - (success(true|false),error())
     */
    checkNewPasswordNotUsed(userID, newPassword, username = null) {
        let that = this;

        //require password class
        this.setPasswordClass();

        //ALGORITHM
        //retrieve user information using either username or userID
        //check the new password with the current password and all older passwords
        //check if new password have not been used.
        //if the new password matches the current password, it means it is being used.
        //return if not status

        //retrieval method to be executed
        let methodToBeExecuted = null;
        if (userID)
            methodToBeExecuted = this.userAccountDriver.retrieveUserInformation(userID, this.restaurantID);
        else if (!userID && username)
            methodToBeExecuted = this.userAccountDriver.getUserInformationUsingUsername(username);

        //fetch user information using either of the executed method
        return methodToBeExecuted.then(function(fetchedData) {
            //using a more descriptive name
            let newPasswordNotUsed = true;

            if (!_.isNull(fetchedData) && !_.isEmpty(fetchedData)) {
                let passNotInArray = true;
                let currentPassNotUsed = true;

                //define the current password and check if not used
                let currentPassword = fetchedData.password ? fetchedData.password : "";
                if (currentPassword) {
                    //negate the matching of the raw pass with the encrypted pass
                    //if passwords match(true), not exists = false
                    //if password doesn't match(false), not exists  = true;
                    currentPassNotUsed = !that.passwordObj.compareTwoPasswords(newPassword, currentPassword);
                }

                //define old passwords
                let oldPasswords = fetchedData.oldPasswords && Array.isArray(fetchedData.oldPasswords) ?
                    fetchedData.oldPasswords : [];

                //no need to check the old passwords, if the new password is the current one
                //i.e has been used.
                if (currentPassNotUsed && oldPasswords.length > 0) {
                    //check if new password is not in encrypted array
                    passNotInArray = that.passwordObj.passwordNotInEncryptedArray(newPassword, oldPasswords);
                }

                //new password not exist in current password or pasword array 
                newPasswordNotUsed = currentPassNotUsed && passNotInArray ? true : false;
            }

            return newPasswordNotUsed;
        });
    }

    /**
     * Check the provided password for the user if it exists(or is valid)
     * Check the current password or the older password
     * @param {String} username
     * @param {String} password
     * @return {Promise} -promise(updated information)
     */
    checkRecoverPasswordValid(username, password) {
        let that = this;

        //require password class
        this.setPasswordClass();

        //ALGORITHM
        //retrieve user information
        //check the new password with the current password and all older passwords
        //check if new password have not been used.
        //if the new password matches the current password, it means it is being used.
        //return if not status

        return this.userAccountDriver.getUserInformationUsingUsername(username)
            .then(function(fetchedData) {
                //using a more descriptive name
                let passwordExists = true;

                if (!_.isNull(fetchedData) && !_.isEmpty(fetchedData)) {
                    let passNotInArray = true;
                    let currentPassNotUsed = true;

                    //define the current password and check if not used
                    let currentPassword = fetchedData.password ? fetchedData.password : "";
                    if (currentPassword) {
                        //negate the matching of the raw pass with the encrypted pass
                        //if passwords match(true), not exists = false
                        //if password doesn't match(false), not exists  = true;
                        currentPassNotUsed = !that.passwordObj.compareTwoPasswords(password, currentPassword);
                    }

                    //define old passwords
                    let oldPasswords = fetchedData.oldPasswords && Array.isArray(fetchedData.oldPasswords) ?
                        fetchedData.oldPasswords : [];

                    //no need to check the old passwords, if the new password is the current one
                    //i.e has been used.
                    if (currentPassNotUsed && oldPasswords.length > 0) {
                        //check if new password is not in encrypted array
                        passNotInArray = that.passwordObj.passwordNotInEncryptedArray(password, oldPasswords);
                    }

                    //password exists is the negation of password not exists
                    passwordExists = !(currentPassNotUsed && passNotInArray) ? true : false;
                }

                return passwordExists;
            });
    }

    /**
     * Save new user password 
     * @param {String} userID
     * @param {String} newPassword
     * @return {Promise} -promise(updated information)
     */
    saveNewPassword(userID, newPassword) {
        let that = this;

        //require password class
        this.setPasswordClass();

        return this.userAccountDriver.retrieveUserInformation(userID, this.restaurantID)
            .then(function(returnedData) {
                if (!_.isNull(returnedData) && !_.isEmpty(returnedData)) {
                    //retrieve old passwords
                    let oldPassword = { password: returnedData.password, date: new Date() };

                    let updatedInfo = {
                        password: that.passwordObj.encryptPassword(newPassword),
                        $push: { oldPasswords: oldPassword }
                    };

                    //save password only the password information(update)
                    return that.userAccountDriver.updateUserInformation(userID, that.restaurantID, updatedInfo);
                } else {
                    //return dummy promise
                    return new Promise(function(resolve, reject) {
                        resolve(false);
                    });
                }
            }).then(function(updatedInformation) {
                //return updated user information
                return updatedInformation;
            });
    }

    /**
     * Check if user exists and return his/her reportSpecs,and recovery options
     * @param {String} username
     * @return {Promise} - promise(recovery specifications)
     */
    confirmUsername(username) {
        let that = this;

        //find by username
        return this.userAccountDriver.getUserInformationUsingUsername(username)
            .then(function(results) {
                //confirm if results exist
                let confirm = (_.isNull(results) || _.isEmpty(results)) ? false : true;

                //construct recovery specification
                let recoverySpec = {
                    oldPasswords: false,
                    userEmail: false,
                    recoveryEmail: false,
                    recoveryNumber: false
                }
                let form = {
                    exist: confirm,
                    recoverySpecs: recoverySpec,
                    recoveryOptions: null,
                    username: "",
                    userType: ""
                }

                //if user exist
                if (confirm) {
                    //check if the username is an email and set userEmail
                    if (validate.email(results.userName)) {
                        recoverySpec.userEmail = true;
                    }

                    if (results.recovery) {
                        //deifne specifications
                        recoverySpec.recoveryEmail = results.recovery.email ? true : false;
                        recoverySpec.recoveryNumber = results.recovery.number ? true : false;
                    }

                    //if oldpasswords exist
                    if (results.oldPasswords.length > 0) {
                        recoverySpec.oldPasswords = true;
                    }

                    //set username(email) and recovery options.
                    form.username = results.userName ? results.userName : "";
                    form.userType = results.accountType ? results.accountType : "";
                    form.recoveryOptions = results.recovery;
                }

                //return recovery options/specification
                return form;
            });
    }

    /**
     * Update userinformation using only the username
     * @param {Object} userData -object{username,..}
     * @return {Promise(success(boolean),error)} - (success(true|false),error())
     */
    updateUserInformationUsingUsername(userData) {
        let that = this;

        return this.userAccountDriver.updateUserInformationUsingUsername(userData)
            .then(function(updatedInformation) {
                //if updatedinformation, return true else return false
                return updatedInformation ? true : false;
            });
    }

    /**
     * Send recovery code to user's email
     * and update databse with recover info
     * @param {string} username 
     * @param {string} userEmail 
     * @return {Promise(success(object),error)} - {emailValid:bool,emailSent:bool}
     */
    sendRecoveryCodeToMail(username, userEmail) {
        let that = this;

        let returnedResults = { emailValid: false, emailSent: false }
        let recoveryCode = "";

        //ALGORITHM
        //CHECK IF THE RECOVERY CODE PROVIDED IS VALID
        //IF VALID:
        //  GENERATE A CODE AND ADD  AS THE CONFIRMATION CODE
        //  UPDATE THE RECOVERY CODE IN THE USER'S DOCUMENT
        //  SEND THE CODE TO THE PROVIDED EMAIL

        //retrieve the user's information
        return this.userAccountDriver.getUserInformationUsingUsername(username)
            .then((results) => {
                if (results) {
                    let recoveryEmail = results.recovery && results.recovery.email ?
                        results.recovery.email : "";

                    //check the userEmail with the username or recovery email
                    if (userEmail === username || userEmail === recoveryEmail) {
                        returnedResults.emailValid = true;

                        //generate the recovery code
                        return codeGenerator.generateCode()
                            .then((code) => {
                                recoveryCode = code;

                                let tempRecoveryCode = {
                                    code: recoveryCode,
                                    date: new Date()
                                }

                                //udpate recovery code with username
                                return that.updateRecoveryCode(username, { tempRecoveryCode: tempRecoveryCode });
                            })
                            .then(function(results) {
                                if (recoveryCode) {
                                    //send recovery code mail
                                    return mailClass.sendRecoveryCodeMail(userEmail, recoveryCode);
                                }
                            })
                            .then((mailSent) => {
                                returnedResults.emailSent = mailSent ? true : false;

                                return returnedResults;
                            });
                    }
                }

                //return results;
                return returnedResults;
            });
    }

    /**
     * Save recovery code
     * @param {String} username
     * @param {object} userInformtion -object{}
     * @return {Promise} -promise(updated information)
     */
    updateRecoveryCode(username, userInformation) {
        let that = this;

        return this.userAccountDriver.updateUserInformationUsingUsername(username, userInformation)
            .then(function(updatedInformation) {
                //if updated information, return true else return false
                return updatedInformation ? true : false;
            });
    }


    /**
     * Validate the provided recovery code with the available info in the db
     * @param {String} username 
     * @param {String} recoveryCode 
     * @return {Promise} -promise(code validity)
     */
    validateRecoveryCode(username, recoveryCode) {
        let that = this;

        //fetch recovery code and compare with that in the document
        return this.userAccountDriver.getUserInformationUsingUsername(username)
            .then(function(results) {
                let returnedResults = { codeValid: false, codeExpired: false };

                //if user exist
                if (!_.isNull(results) && !_.isEmpty(results)) {
                    if (results.tempRecoveryCode && results.tempRecoveryCode.code &&
                        results.tempRecoveryCode.date) {
                        //define recovery code
                        let tempRecoveryCode = results.tempRecoveryCode ? results.tempRecoveryCode : "";

                        //check how old the code is..true if older than 24hrs                        
                        let today = moment(new Date());
                        let codeSavedDate = moment(tempRecoveryCode.date);
                        let dateDifference = today.diff(codeSavedDate, "days");

                        //recovery code is only valid for one day
                        returnedResults.codeExpired = (dateDifference > 0) ? true : false;

                        if (dateDifference < 1 && tempRecoveryCode.code === recoveryCode) {
                            returnedResults.codeValid = true;
                        }
                    }
                }

                return returnedResults;
            });
    }

    /** 
     * Update user password with new password
     * @param {String} userID - user whose password is to be changed
     * @param {string} newPassword - new password to be udpated
     * @return {Promise<{isSaved:boolean>}
     */
    updateUserNewPassword(userID, newPassword) {
        this.setPasswordClass();

        //encrypt password before updating
        newPassword = this.passwordObj.encryptPassword(newPassword);

        //update user's password
        return this.userAccountDriver.updateUserPasswordInfo(userID, newPassword, this.restaurantID)
            .then(function(res) {
                //res will be needed to check if update was successful.
                //some users may not have account information(students|staff)
                //and hence cannot have their passwords updated.
                return { isSaved: res ? true : false };
            });
    }

    getCustomerName(userID) {
        let that = this;

        return this.userAccountDriver.retrieveCustomerName(userID)
            .then(returned => {
                if (_.isNull(returned) || _.isEmpty(returned)) {
                    return { success: false }
                } else {
                    return { success: true, name: returned }
                }
            })
    }



    /**
     * Update a user's account information
     * @param {String} userID
     * @param {Object} userInformation
     * @return {Promise}
     */
    // updateUserAccountInformation(userID,userInformation){
    //     //update a user's information
    //     return this.userAccountDriver.updateUserInformation(userID,this.restaurantID,userInformation)
    //         .then((results)=>{
    //             return {isSaved:true};
    //         });
    // }

    /**
     * Get userID and restaurantID from username
     * @param {String} username
     * @return {Promise}
     */
    getUserID(username) {
        //retrieve user information
        return this.userAccountDriver.getUserInformationUsingUsername(username)
            .then(function(results) {
                let userInfo = { userID: null };

                //data should be available
                if (!_.isEmpty(results) && !_.isNull(results)) {
                    userInfo.userID = results.userID;
                    // userInfo.restaurantID = results.restaurantID;
                }

                return userInfo;
            });
    }
} //end of class

//export class
module.exports = UserAccountSettings;