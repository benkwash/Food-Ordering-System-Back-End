/*
 * This class serves as a driver for the 'restaurant-Info' schema/Model
 * All the nitty-gritty will be handled here
 */
var Promise = require("bluebird");
var mongoose = require("mongoose");

class RestaurantInfoSchemaDriver {
    //constructor
    constructor(connection) {
        this.restaurantInfoModel = null;
        this.connection = connection;
        //require school-info model
        this.setRestuarantInfoModel();
    }

    /**
     * This methods calls restaurant-info schema and assigns it to restaurantInfoModel
     * @param {} - 
     * @return {} - none
     */
    setRestuarantInfoModel() {
        this.setRestuarantInfoModel = require("../models/restaurant-info")(this.connection);
    }

    /**
     * Update restaurant's setup|configuration information
     * @param {Object} info 
     * @param {String} restaurantID
     * @return {Promise} 
     */
    updateRestaurantInformationNew(info, restaurantID) {
            let that = this;
            return new Promise(function(resolve, reject) {
                //find and update
                that.setRestuarantInfoModel.findOneAndUpdate({ _id: restaurantID }, info).exec()
                    .then(function(user) {
                        resolve(user);
                    }).catch(function(error) {
                        reject(error);
                    });
            }); //end of main promise
        } //end of method

    /**
     * Update restaurant's administrator's information
     * @param {Object} info 
     * @param {String} restaurantID
     * @param {String} adminID
     * @return {Promise} 
     */
    updateRestaurantAdminInformation(info, restaurantID, adminID) {
            let that = this;

            //loop through the elements of info object
            //append the adminInfo.$. to each property name to be updated
            //update query should look like:{adminInfo.$.prop1:val,adminInfo.$.prop2:val,...}
            let toBeUpdated = {};
            for (let prop in info) {
                toBeUpdated["adminInfo.$." + prop] = info[prop];
            }

            return new Promise(function(resolve, reject) {
                //include the adminInfo sub document in the array query
                that.setRestuarantInfoModel.findOneAndUpdate({ _id: restaurantID, "adminInfo._id": adminID }, { $set: toBeUpdated }).exec()
                    .then(function(user) {
                        resolve(user);
                    }).catch(function(error) {
                        reject(error);
                    });
            }); //end of main promise
        } //end of method

    /**
     * Save only restuarant-admin information 
     * @param {Object} info - adminInfo(object)
     * @return {Promise} - promise(array of objects,error)
     * 12-09-2018
     */
    insertRestaurantInfo(info) {
        let saveInfo = new this.setRestuarantInfoModel(info);

        return new Promise(function(resolve, reject) {
            saveInfo.save()
                .then(function(savedInfo) {
                    resolve(savedInfo);
                })
                .catch(function(err) {
                    reject(error);
                });
        });
    }

    /**
     * Retrieve any info for a given restaurant
     * @param {Object} returned - included,excluded fields
     * @param {String} restaurantID - 
     * @return {Promise} - promise(array of objects,error)
     * 22-07-2018
     */
    getRestaurantInfo(restaurantID) {
        let that = this;
        return new Promise(function(resolve, reject) {
            // get restuarant information
            that.setRestuarantInfoModel.findById(restaurantID).exec()
                .then(function(results) {
                    resolve(results);
                }).catch(function(error) {
                    reject(error);
                }); //end of query
        }); //end of promise
    }

} //end of class

//exports
module.exports = RestaurantInfoSchemaDriver;