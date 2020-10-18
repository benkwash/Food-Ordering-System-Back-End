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

        this.resInfoModelDriver(); //initalise driver
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

    //save new configuration information
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


    updateConfigInformation(update) {
        let that = this;

        return this.configureDriver.updateConfigInfo(that.restaurantID, update)
            .then((update) => {
                return update;
            });

    }

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
        let toReturn = []
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