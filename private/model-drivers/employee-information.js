var Promise = require("bluebird");
var mongoose = require("mongoose");


class EmployeeInfo {

    constructor(connection) {
        this.employeeInfoModel = null;
        this.connection = connection;

        this.setEmployeeInfo();

    }

    //assign employeeinfo schema
    setEmployeeInfo() {
        this.employeeInfoModel = require('../models/employee-information')(this.connection);
    }



    //other functions

    /**
     * This method creates a new staff doc
     *  @param {Object} staffInfo
     *  @return {Promise} - promise(mongoose doc/error)
     */
    saveEmployeeInfo(staffInfo) {

        let newStaff = new this.employeeInfoModel(staffInfo);

        return new Promise((resolve, reject) => {
            newStaff.save()
                .then((savedInfo) => {
                    resolve(savedInfo);
                }).catch((error) => {
                    reject(error);
                })

        }); //end of promise
    }

    /**
     * This method updates staff info
     *  @param {Object} update
     *  @return {Promise} - promise(mongoose doc/error)
     */
    updateEmployeeInfo(update) {
        let that = this;

        let id = update._id;
        return new Promise((resolve, reject) => {

            that.employeeInfoModel.findOneAndUpdate({
                    _id: id
                }, update, {
                    new: true
                })
                .exec()
                .then((returned) => {
                    resolve(returned);
                }).catch((error) => {
                    reject(error);
                })
        })

    }

    /**
     * This method updates staff info using the staff's userid
     *  @param {Object} update
     *  @return {Promise} - promise(mongoose doc/error)
     */
    updateEmployeeInfoWithUserID(update) {
        let that = this;

        let id = update.userID;
        return new Promise((resolve, reject) => {

            that.employeeInfoModel.findOneAndUpdate({
                    userID: id
                }, update, {
                    new: true
                })
                .exec()
                .then((returned) => {
                    resolve(returned);
                }).catch((error) => {
                    reject(error);
                })
        })

    }


    /**
     * This method retrieves a restaurant staff info
     *  @param {String} userID
     *  @param {String} restaurantID 
     *  @return {Promise} - promise(mongoose doc/error)
     */
    retrieveEmployeeInformation(userID, restaurantID) {
        let that = this;

        return new Promise(function(resolve, reject) {
            that.employeeInfoModel.findOne({
                    userID: userID,
                    restaurantID: restaurantID
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
     * This method gets staff information using the staff doc id
     *  @param {String} id -mongo doc id
     *  @param {String} restaurantID 
     *  @return {Promise} - promise(mongoose doc/error)
     */
    retrieveEmployeeInfoWithDocID(id, restaurantID) {
        let that = this;

        return new Promise(function(resolve, reject) {
            that.employeeInfoModel.findOne({
                    _id: id,
                    restaurantID: restaurantID
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
     * This method gets all restaurant staff
     *  @param {String} restaurantID 
     *  @return {Promise} - promise(mongoose doc/error)
     */
    retrieveAllEmployeeInformation(restaurantID) {
        let that = this;

        return new Promise((resolve, reject) => {
            that.employeeInfoModel.find({ restaurantID: restaurantID, isActive: true })
                .sort({ fName: 'asc' })
                .exec()
                .then((returned) => {
                    resolve(returned);
                }).catch((error) => {
                    reject(error);
                })
        }); //end of promise
    }

    /**
     * This method retrieves all staff with delivery permission
     *  @param {String} resID
     *  @return {Promise} - promise(mongoose doc/error)
     */
    getDeliveryStaff(resID) {
        let that = this;

        return new Promise((resolve, reject) => {
            that.employeeInfoModel.find({
                    restaurantID: mongoose.Types.ObjectId(resID),
                    isActive: true,
                    "permissions.delivery": true
                }, {
                    fName: 1,
                    lName: 1,
                    userID: 1
                })
                .exec()
                .then(staff => {
                    resolve(staff);
                }).catch(error => {
                    reject(error);
                })
        })
    }

}

module.exports = EmployeeInfo;