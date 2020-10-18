const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');

//model drivers
const cart = require("../model-drivers/customer-cart");
const resconfig = require("../model-drivers/restaurant-configure");
const resinfo = require("../model-drivers/restaurant-Information");
const resmenu = require("../model-drivers/restaurant-menu");



class RatingOperations {

    constructor(connection, userID, restaurantID) {
        this.connection = connection;
        this.userID = userID;
        this.restaurantID = restaurantID;

        this.cartDriver = new cart(connection);
        this.resConfigDriver = new resconfig(connection);
    }



    getAccountsDetails() {
        let that = this;

        return this.cartDriver.getRestaurantAccounts(this.restaurantID)
            .then(response => {

                let dataToReturn = []
                    //get all months and amount in the format {month:month,amount:0}
                for (let i = 1; i < 13; i++) {
                    dataToReturn[i - 1] = {
                        month: moment().month(i - 1).format("MMMM"),
                        amount: 0
                    };
                }
                if (!_.isNull(response) || !_.isEmpty(response)) {
                    //match/assign returned amount to specific months
                    response.forEach(doc => {
                        dataToReturn[doc._id].amount = doc.total;
                    })
                }
                return dataToReturn;
            })

    }

    getDetailsForNPastDays(days = 8) {
        let that = this;
        var days = days; // Days you want to subtract
        var date = new Date();
        var nDayDate = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
        // var day =last.getDate();
        // var month=last.getMonth()+1;
        // var year=last.getFullYear();

        return this.cartDriver.getRestaurantAccountsLastNDays(this.restaurantID, nDayDate)
            .then(response => {
                let dataToReturn = []
                for (let i = 0; i < days; i++) {
                    dataToReturn[i] = {
                        date: new Date(date.getTime() - ((i) * 24 * 60 * 60 * 1000)),
                        amount: 0
                    }
                }
                //'2020-10-01'
                //{date: Thu Oct 01 2020 18:46:11 GMT+0000 (Greenwich Mean Time), amount: 0}
                if (!_.isNull(response) || !_.isEmpty(response)) {
                    //match/assign returned amount to specific dates
                    response.forEach((doc, id) => {
                        dataToReturn.forEach((doc2, index) => {
                                //get and comepare dates instead of full date
                                if (doc2.date.getDate() == new Date(doc._id).getDate()) {
                                    dataToReturn[index].amount = doc.total
                                }
                            })
                            // dataToReturn[doc._id].amount = doc.total;
                    })
                }


                return dataToReturn;
            })
    }

}




module.exports = RatingOperations;