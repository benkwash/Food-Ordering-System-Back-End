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

    saveEmployeeInfo(info) {

        let that = this;
        let newStaff = new this.employeeInfoModel(info);

        return new Promise((resolve, reject) => {

            newStaff.save()
                .then((savedInfo) => {
                    resolve(savedInfo);
                }).catch((error) => {
                    reject(error);
                })

        }); //end of promise
    }

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
    retrieveEmployeeInfoWithDocID(id,restaurantID){
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
        }); //endd of promise
    }

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