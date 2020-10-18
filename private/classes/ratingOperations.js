const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');

//model drivers
const cart = require("../model-drivers/customer-cart");
const resconfig = require("../model-drivers/restaurant-configure");
const resinfo = require("../model-drivers/restaurant-Information");
const resmenu = require("../model-drivers/restaurant-menu");

const empInfo = require("../model-drivers/employee-information")




class RatingOperations {

    constructor(connection, userID, restaurantID) {
        this.connection = connection;
        this.userID = userID;
        this.restaurantID = restaurantID;

        this.cartDriver = new cart(connection);
        this.resConfigDriver = new resconfig(connection);
    }


    //dummy func
    getResRating() {
        let that = this;

        var ratingReturn = {
            rating: 0,
            outOf: 0,
            breakdown: {
                five: 0,
                four: 0,
                three: 0,
                two: 0,
                one: 0
            }
        }
        return this.cartDriver.getRating(this.restaurantID)
            .then(rating => {
                if (!_.isEmpty(rating)) {
                    rating = rating[0];
                    ratingReturn.rating = rating.average;
                    ratingReturn.outOf = rating.total;

                    return this.cartDriver.getRatingBreakdown(that.restaurantID)
                } else return false
            }).then((breakdown) => {
                if (!_.isEmpty(breakdown) || breakdown) {
                    breakdown.forEach((doc) => {
                        if (doc._id == 5) ratingReturn.breakdown.five = doc.total;
                        else if (doc._id == 4) ratingReturn.breakdown.four = doc.total;
                        else if (doc._id == 3) ratingReturn.breakdown.three = doc.total;
                        else if (doc._id == 2) ratingReturn.breakdown.two = doc.total;
                        else ratingReturn.breakdown.one = doc.total;
                    });

                    // let ratingSum = _.sum(_.values(ratingReturn.breakdown)); ///sum all rating breakdown numbs
                    ratingReturn.breakdown.five = (ratingReturn.breakdown.five / ratingReturn.outOf) * 100;
                    ratingReturn.breakdown.four = (ratingReturn.breakdown.four / ratingReturn.outOf) * 100;
                    ratingReturn.breakdown.three = (ratingReturn.breakdown.three / ratingReturn.outOf) * 100;
                    ratingReturn.breakdown.two = (ratingReturn.breakdown.two / ratingReturn.outOf) * 100;
                    ratingReturn.breakdown.one = (ratingReturn.breakdown.one / ratingReturn.outOf) * 100;
                }

                return ratingReturn;
            })
    }



    getReviews() {
        let that = this;

        return this.cartDriver.getReviews(this.restaurantID)
            .then(returnedReviews => {
                return returnedReviews;
            })
    }

    sendReply(reply) {
        let that = this;

        let _id = reply._id;
        delete reply._id;

        reply.by = this.userID;

        let cartUpdate = {
            $push: {
                'review.replies': reply
            }
        }

        return this.cartDriver.updateCartInfo(_id, cartUpdate)
            .then(update => {
                if (!_.isNull(update)) return true;
                else return false
            })
    }
}




module.exports = RatingOperations;