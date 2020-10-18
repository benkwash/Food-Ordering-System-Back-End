const _ = require('lodash');
const moment = require('moment');

const func = require('../functions/functionsClass');


const employeeInfo = require('../model-drivers/employee-information')
const userInfo = require('../model-drivers/user-account-settings')
const passwordClass = require('./password');

class AdminOperations {

    constructor(connection, userID, resID) {
        this.userID = userID;
        this.restaurantID = resID;

        this.connection = connection;

        this.employeeInfoDriver = null;
        this.userAccountDriver = null

        this.configureEmployeeDriver();
        this.configureUserDriver();
    }

    configureEmployeeDriver() {
        this.employeeInfoDriver = new employeeInfo(this.connection);
    }

    configureUserDriver() {
        this.userAccountDriver = new userInfo(this.connection);
    }



    //functions

    /**
     * save staff info
     * @param {String} staffInfo
     * @return {Promise}
     */
    saveStaffInfo(staffInfo) {

        let that = this;
        let newStaff = staffInfo;

        newStaff["restaurantID"] = this.restaurantID;
        newStaff["addedBy"] = this.userID;

        return this.employeeInfoDriver.saveEmployeeInfo(newStaff)
            .then((returned) => {
                return returned;
            });
    }

    /**
     * get staff permissions info
     * @param {String} staffID
     * @return {Promise}
     */
    getStaffInformation(staffID) {

        let that = this;

        return this.employeeInfoDriver.retrieveEmployeeInformation(staffID, this.restaurantID)
            .then((retrieved) => {
                return retrieved;
            })
    }

    retrieveEmployeeInfoWithDocID(id) {
        let that = this;

        return this.employeeInfoDriver.retrieveEmployeeInfoWithDocID(id, this.restaurantID)
            .then((retrieved) => {
                return retrieved;
            })
    }

    /**
     * get all staff information
     * @param {String} staffInfo
     * @return {Promise}
     */
    getAllStaffInformation() {
        let that = this;

        return this.employeeInfoDriver.retrieveAllEmployeeInformation(this.restaurantID)
            .then((returned) => {

                return returned;
            })
    }

    /**
     * get all staff information
     * @param {String} staffInfo
     * @return {Promise}
     */
    updateStaffInformation(update) {
        let that = this;

        return this.employeeInfoDriver.updateEmployeeInfo(update)
            .then((returned) => {

                return returned;
            })
    }

    /**
     * get staff permissions info
     * @param {String} permissionType
     * @return {Promise}
     */
    getStaffPermissions(permissionType) {
        let that = this;

        return this.employeeInfoDriver.retrieveEmployeeInformation(that.userID, that.restaurantID)
            .then((returned) => {

                let hasPermission = false;
                if (!_.isNull(returned.permissions)) {

                    let permissions = returned.permissions;
                    if (permissions[permissionType]) {
                        hasPermission = true
                    }
                }

                return hasPermission;

            })

    }

    /**
     * get staff permissions info
     * @param {String} permissionType
     * @return {Promise}
     */
    getAllStaffPermissions() {
        let that = this;

        return this.employeeInfoDriver.retrieveEmployeeInformation(that.userID, that.restaurantID)
            .then((returned) => {

                let permissions = null;
                if (!_.isNull(returned.permissions)) {
                    permissions = returned.permissions;
                }
                return permissions;

            })

    }

    /**
     * create staff account
     * @param {String} staffInfo
     * @return {Promise}
     */
    createStaffAccount(staffinfo) {
        //algorithm
        //create an account with the given username and generated password
        //reuturn userid from created acount and update in the employee info schema/doc


        let that = this;
        let staffInfo = staffinfo;
        let staffUsername = staffInfo.username;
        let permission = staffInfo.permissions;
        let staffDocID = staffInfo._id; //id from employee info schema not useraccountsetting schema

        let password = func.generateRawPassword(); //generate random password for staff account

        let passclass = new passwordClass();

        let encryptedPassword = passclass.encryptPassword(password); //encrypt password before saving in db for security reasons

        let accountDetails = {
            email: staffUsername,
            password: encryptedPassword,
            restaurantID: this.restaurantID,
            accountType: 'staff',

        };
        //create user account
        return this.userAccountDriver.createEmployeeAccount(accountDetails)
            .then((returned) => {
                //if account is sccessfully created
                if (!_.isNull(returned)) {
                    let employeeUpdate = {
                            _id: staffDocID,
                            permissions: permission,
                            userID: returned.userID,
                        }
                        //update employee info doc with returned id
                    return that.employeeInfoDriver.updateEmployeeInfo(employeeUpdate);

                } else {
                    return false;
                }

            }).then((update) => {
                //if successfully updated
                if (!_.isNull(update)) {
                    return { success: true, password: password }
                } else {
                    return { success: false }
                }

            })


    }

    resetStaffPassword(staffinfo) {
        let password = func.generateRawPassword(); //generate random password for staff account

        let passclass = new passwordClass();

        let encryptedPassword = passclass.encryptPassword(password); //encrypt password before saving in db for security reasons

        //update nwpassword
        return this.userAccountDriver.updateUserInformation(staffinfo.userID, { password: encryptedPassword })
            .then((returned) => {

                if (returned) {
                    return { success: true, password: password }
                } else {
                    return { success: false }
                }
            });

    }


    /**
     * create staff account
     * @param {String} staffInfo {userID:idd}
     * @param {String} action "enable" or "disable" account
     * @return {Promise}
     */
    updateStaffAccount(staffinfo, action) {
        let that = this;


        let update = {
            userID: staffinfo.userID,
            isDeactivated: (action == "disable") ? true : false //if action is disable, ser isdeactivated to true
        }
        return this.employeeInfoDriver.updateEmployeeInfoWithUserID(update)
            .then((returned) => {
                if (returned) {
                    return that.userAccountDriver.updateUserInformation(update.userID, { isActive: (action == "disable") ? false : true })
                } else {
                    return false
                }
            }).then((update) => {
                if (update) {
                    return { success: true }
                } else {
                    return { success: false }
                }
            })
    }


}


module.exports = AdminOperations