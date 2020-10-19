const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');

//model drivers
const resConfig = require("../model-drivers/restaurant-configure");
const cartDriver = require('../model-drivers/customer-cart');
const resInformation = require('../model-drivers/restaurant-Information')

class AdminOperations {

    constructor(connection, userID, resID) {
        this.userID = userID;
        this.restaurantID = resID;

        this.connection = connection;

        this.configureDriver = null;
        this.cartDriver = null;
        this.resInfoDriver = null;

        this.configureModelDriver();

    }

    configureModelDriver() {
        this.configureDriver = new resConfig(this.connection);
    }
    cartModelDriver() {
        this.cartDriver = new cartDriver(this.connection);
    }
    resInfoModelDriver() {
        this.resInfoDriver = new resInformation(this.connection)
    }

    getRestaurantInfo() {
        let that = this;

        this.resInfoModelDriver(); //initalize driver
        let data = {
            name: null,
            picture: null
        }

        return this.configureDriver.getConfigInfo(this.restaurantID)
            .then((returned) => {
                if (!_.isNull(returned)) data.picture = returned.picture;
                return that.resInfoDriver.getRestaurantInfo(this.restaurantID)
            }).then(resInfo => {
                if (!_.isNull(resInfo)) data.name = resInfo.name;

                return data;
            })
    }

    /**
     * save new configuration information
     * @param {Object}  newConfigu -configuration info
     * @return {Promise} - Object or Boolean(false)
     */
    saveConfigInformation(newConfigu) {
        let that = this;

        let newConfig = newConfigu;
        newConfig['restaurantID'] = this.restaurantID;
        return this.configureDriver.saveNewConfiguration(newConfig)
            .then((savedConfig) => {
                if (!_.isNull(savedConfig)) {
                    return savedConfig;
                } else {
                    return false;
                }
            });

    }

    /**
     * get restaurant configuration information
     * @param {} 
     * @return {Promise} - Object or Boolean(false)
     */
    getConfigInformation() {
        let that = this;

        return this.configureDriver.getConfigInfo(that.restaurantID)
            .then((configInfo) => {
                if (!_.isNull(configInfo)) {
                    return configInfo
                } else {
                    return false;
                }
            });

    }

    /**
     * update restaurant configuration information
     * @param {Object} update
     * @return {Promise} - Object or Boolean(false)
     */
    updateConfigInformation(update) {
        let that = this;
        return this.configureDriver.updateConfigInfo(that.restaurantID, update)
            .then((update) => {
                if (!_.isNull(update)) return update;
                else return false
            });

    }

    /**
     * get restaurant order statistics for the current year
     * get the sum for specific type of orders for the year
     * this will be visualised in a chart in the frontend
     * @param {}
     * @return {Promise}
     */
    getRestaurantStats() {
        let that = this;
        this.cartModelDriver(); //instantiate db

        let data = {
                pickup: [],
                table: [],
                delivery: []
            }
            //i for clean up this code later
            //get data for pickup
        return this.cartDriver.getRestaurantStats(this.restaurantID, "pickup")
            .then(pickupData => {
                data.pickup = pickupData;
                //get data for delivery
                return that.cartDriver.getRestaurantStats(that.restaurantID, "delivery")
            }).then(deliveryData => {
                data.delivery = deliveryData;

                return that.cartDriver.getRestaurantStats(that.restaurantID, "table")
            }).then(tableData => {
                data.table = tableData;

                let pickup = this.sortData(data.pickup)
                let table = this.sortData(data.table)
                let delivery = this.sortData(data.delivery)

                let finalData = [{
                    name: 'Deliveries',
                    data: delivery
                }, {
                    name: 'Pickup',
                    data: pickup
                }, {
                    name: 'Seat reservations',
                    data: table
                }]
                return finalData
            })
    }
    sortData(data) {
        let today = new Date;
        let month = today.getMonth() + 1; //numb...month starts at 0//mongobd's start at 1
        //get months from the beginning of the year to current month
        let toReturn = [] //an array of sum/revenue...position of data is the month
        for (let i = 0; i < month; i++) {
            toReturn[i] = 0;
        }
        data.forEach((doc, index) => {
            toReturn[doc._id - 1] = doc.total;
        })

        return toReturn;
    }
}
module.exports = AdminOperations;