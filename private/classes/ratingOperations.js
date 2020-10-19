const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');

//model drivers
const cart = require("../model-drivers/customer-cart");
const resconfig = require("../model-drivers/restaurant-configure");


class RatingOperations {

    constructor(connection, userID, restaurantID) {
        this.connection = connection;
        this.userID = userID;
        this.restaurantID = restaurantID;

        this.cartDriver = new cart(connection);
        this.resConfigDriver = new resconfig(connection);
    }


    /**
     * get restaurant ratings
     * @param {}
     * @return {Promise} - Object (ratings detail)
     */
    getResRating() {
        let that = this;

        var ratingReturn = {
            rating: 0, //rating
            outOf: 0, //number of ratings
            breakdown: { //breakdown. percentage of each star review
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



    /**
     * get restaurant reviews
     * @param {}
     * @return {Promise} - Object (reviews)
     */
    getReviews() {

        return this.cartDriver.getReviews(this.restaurantID)
            .then(returnedReviews => {
                return returnedReviews;
            })
    }

    /**
     * send replies to reviews
     * @param {String} reply
     * @return {Promise} - Boolean
     */
    sendReply(reply) {

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