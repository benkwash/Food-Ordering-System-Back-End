var Promise = require("bluebird");
var mongoose = require('mongoose');
const { reject, reduceRight } = require("lodash");

class CustomerCart {

    constructor(connection) {
        this.cartInfoModel = null;
        this.connection = connection;

        this.setCartInfo();


    }

    //assign customer cart schema
    setCartInfo() {
        this.cartInfoModel = require('../models/customer-cart')(this.connection);
    }

    //other functions

    //setDefaultsOnInsert
    saveNewCartInfo(cartInfo) {
        let that = this;

        let cart = new this.cartInfoModel(cartInfo);

        return new Promise((resolve, reject) => {
            cart.save()
                .then(savedCart => {
                    resolve(savedCart)
                }).catch(err => {
                    reject(err)
                });

        });
    }

    retrieveOneOrderDetail(id, restaurantID) {
        let that = this;

        return new Promise((resolve, reject) => {
            that.cartInfoModel.aggregate([{
                    $match: {
                        restaurantID: mongoose.Types.ObjectId(restaurantID),
                        _id: mongoose.Types.ObjectId(id)
                    }
                }, {
                    $lookup: {
                        from: "USER_ACCOUNT_SETTINGS",
                        localField: "customerID",
                        foreignField: "userID",
                        as: "customerInfo"
                    }
                }])
                .exec(function(error, orders) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(orders);
                    }

                }); //end of query
        })
    }


    retrieveOneOrderCustomer(orderID) {
        let that = this;

        return new Promise((resolve, reject) => {
            that.cartInfoModel.findOne({
                    _id: mongoose.Types.ObjectId(orderID)
                }).lean()
                .exec()
                .then(response => {
                    resolve(response);
                }).catch(error => {
                    reject(error);
                })
        })
    }


    getCustomerOrders(id, filter) {
        let that = this;

        let query = {
            customerID: id
        }

        if (filter == 'active') {
            query['customerConfirmation'] = false;
            query['cancelled.cancelled'] = false;
        } else {
            query['$or'] = [{ customerConfirmation: true }, { 'cancelled.cancelled': true }];
            // query['customerConfirmation']=true;
        }
        return new Promise((resolve, reject) => {

            that.cartInfoModel.find(query)
                .lean()
                .sort([
                    ['Date', -1]
                ])
                .exec()
                .then(orders => {
                    resolve(orders);
                }).catch(error => {
                    reject(error)
                })
        })
    }

    getRestaurantOrders(resID) {
        let that = this;

        return new Promise((resolve, reject) => {

            that.cartInfoModel.aggregate([{
                    $match: {
                        restaurantID: mongoose.Types.ObjectId(resID),
                        "cancelled.cancelled": false,
                        "deliveryPerson.deliveryPerson": null,
                        'completed.completed': false

                    }
                }, {
                    $lookup: {
                        from: "USER_ACCOUNT_SETTINGS",
                        localField: "customerID",
                        foreignField: "userID",
                        as: "customerInfo"
                    }
                }])
                .exec(function(error, orders) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(orders);
                    }

                }); //end of query
        })
    }

    getRestaurantOrdersFiltered(resID, mode) {
        let that = this;

        //active
        //waiting
        //completed
        let query = {
            restaurantID: mongoose.Types.ObjectId(resID),
            // "cancelled.cancelled": false,
            // "deliveryPerson.deliveryPerson": null,
            // 'completed.completed': false,
        }
        if (mode == "active") {
            query["cancelled.cancelled"] = false;
            query["deliveryPerson.deliveryPerson"] = null;
            query['completed.completed'] = false;
        } else if (mode == "waiting") {
            query["completed.completed"] = true;
            query["customerConfirmation"] = false;
        } else {
            // { $or:[ {'_id':objId}, {'name':param}, {'nickname':param} ]}
            query["$or"] = [{
                "customerConfirmation": true
            }, {
                "cancelled.cancelled": true
            }]
        }
        return new Promise((resolve, reject) => {

            that.cartInfoModel.aggregate([{
                        $match: query
                    }, {
                        $lookup: {
                            from: "USER_ACCOUNT_SETTINGS",
                            localField: "customerID",
                            foreignField: "userID",
                            as: "customerInfo"
                        }
                    }
                    // , {
                    //     $sort: { "Date": -1 }
                    // }
                ])
                .exec(function(error, orders) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(orders);
                    }

                }); //end of query
        })
    }

    getDeliveryRes(resID, staffID, filter) {
        let that = this;

        let query = {
            restaurantID: mongoose.Types.ObjectId(resID),
            "deliveryPerson.deliveryPerson": { $ne: null }

        }
        if (filter == 'active') {
            query['completed.completed'] = false;
        } else if (filter == 'waiting') {
            query['completed.completed'] = true;
            query['customerConfirmation'] = false;
        } else if (filter == 'delivered') {
            query['completed.completed'] = true;
            query['customerConfirmation'] = true;
        }

        return new Promise((resolve, reject) => {

            that.cartInfoModel.aggregate([{
                    $match: query
                }, {
                    $lookup: {
                        from: "USER_ACCOUNT_SETTINGS",
                        localField: "customerID",
                        foreignField: "userID",
                        as: "customerInfo"
                    }
                }, {
                    $lookup: {
                        from: "EMPLOYEE_INFO",
                        localField: "deliveryPerson.deliveryPerson",
                        foreignField: "userID",
                        as: "deliveryPersonInfo"
                    }
                }])
                .exec(function(error, orders) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(orders);
                    }

                }); //end of query
        })
    }

    getDeliveryResStaff(resID, staffID, filter) {
        let that = this;

        let query = {
            "deliveryPerson.deliveryPerson": mongoose.Types.ObjectId(staffID)

        }
        if (filter == 'active') {
            query['completed.completed'] = false;
        } else if (filter == 'waiting') {
            query['completed.completed'] = true;
            query['customerConfirmation'] = false;
        } else if (filter == 'delivered') {
            query['completed.completed'] = true;
            query['customerConfirmation'] = true;
        }

        return new Promise((resolve, reject) => {

            that.cartInfoModel.aggregate([{
                    $match: query
                }, {
                    $lookup: {
                        from: "USER_ACCOUNT_SETTINGS",
                        localField: "customerID",
                        foreignField: "userID",
                        as: "customerInfo"
                    }
                }])
                .exec(function(error, orders) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(orders);
                    }

                }); //end of query
        })

    }


    updateCartInfo(cartID, update) {
        let that = this;

        let options = {
            // Create a document if one isn't found. Required
            // for `setDefaultsOnInsert`
            upsert: true,
            setDefaultsOnInsert: true,
            new: true
        };
        return new Promise((resolve, reject) => {

            that.cartInfoModel.findOneAndUpdate({
                    _id: mongoose.Types.ObjectId(cartID)
                }, update, options)
                .exec()
                .then((returned) => {
                    resolve(returned);
                }).catch((error) => {
                    reject(error);
                })
        })
    }

    getRating(resID) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.cartInfoModel.aggregate([{
                    $match: {
                        restaurantID: mongoose.Types.ObjectId(resID),
                        "review.rating": { $ne: null }
                    }
                }, {
                    $group: {
                        _id: "null",
                        average: { $avg: "$review.rating" },
                        total: { $sum: 1 }
                    }
                }])
                .exec()
                .then(returned => {
                    resolve(returned)
                }).catch(err => {
                    reject(err)
                })
        })
    }

    getRatingBreakdown(resID) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.cartInfoModel.aggregate([{
                    $match: {
                        restaurantID: mongoose.Types.ObjectId(resID),
                        "review.rating": { $ne: null }
                    }
                }, {
                    $group: {
                        _id: "$review.rating",
                        total: { $sum: 1 }
                    }
                }])
                .exec()
                .then(returned => {
                    resolve(returned)
                }).catch(err => {
                    reject(err)
                })
        })
    }

    getRestaurantStats(resID, mode) {
        let that = this;

        let firstDay = new Date(null, 0); //first day of any year
        return new Promise((resolve, reject) => {

            that.cartInfoModel.aggregate([{
                        $match: {
                            Date: { $gte: firstDay }, //greater than or equal to the first day of the year
                            restaurantID: mongoose.Types.ObjectId(resID),
                            mode: mode
                                // customerConfirmation: true //customer has confirmed order
                        }
                    },
                    {
                        $group: {
                            _id: { $month: "$Date" },
                            total: { $sum: 1 }
                        }
                    }
                ])
                .exec()
                .then(returned => {
                    resolve(returned)
                }).catch(err => {
                    reject(err)
                })
        })
    }


    getReviews(resID) {
        let that = this;

        return new Promise((resolve, reject) => {

            that.cartInfoModel.aggregate([{
                    $match: {
                        restaurantID: mongoose.Types.ObjectId(resID),
                        'review.comment': { $ne: null }
                    }
                }, {
                    $lookup: {
                        from: "USER_ACCOUNT_SETTINGS",
                        localField: "customerID",
                        foreignField: "userID",
                        as: "customerInfo"
                    }
                }, { //merge userinfo document
                    $replaceRoot: {
                        newRoot: {
                            $mergeObjects: [
                                { $arrayElemAt: ["$customerInfo", 0] },
                                "$$ROOT"
                            ]
                        }
                    }
                }, { //fields to be excluded/included/renamed
                    $project: {
                        "_id": 1,
                        'customerID': 1,
                        "review": 1,
                        "fName": 1,
                        "lName": 1,
                        "reply": null,
                    }
                }, {
                    $sort: { "review.date": -1 }
                }]) //sort ..get newest docs first
                // .sort('Date', -1)
                .exec()
                .then(allReviews => {
                    resolve(allReviews)
                }).catch(error => {
                    reject(error)
                })


        })
    }



    getRestaurantAccounts(resID) {
        let that = this;

        let thisYear = new Date(null, 0); //returns first day of the year
        return new Promise((resolve, reject) => {

            that.cartInfoModel.aggregate([{
                        $match: {
                            Date: { $gte: thisYear }, //greater than or equal to the first day of the year
                            restaurantID: mongoose.Types.ObjectId(resID),
                            customerConfirmation: true //customer has confirmed order
                                //automatically means payment has been made
                        }
                    },
                    {
                        $group: {
                            _id: { $month: "$Date" },
                            total: { $sum: "$total" }
                        }
                    }
                ])
                .exec()
                .then(returned => {
                    resolve(returned)
                }).catch(err => {
                    reject(err)
                })
        })
    }

    getRestaurantAccountsLastNDays(resID, date) {
        let that = this;

        return new Promise((resolve, reject) => {

            that.cartInfoModel.aggregate([{
                        $match: {
                            Date: { $gte: date }, //greater than or equal to the past n days
                            restaurantID: mongoose.Types.ObjectId(resID),
                            customerConfirmation: true //customer has confirmed order
                                //automatically means payment has been made
                        }
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } },
                            total: { $sum: "$total" }
                        }
                    }
                ])
                .exec()
                .then(returned => {
                    resolve(returned)
                }).catch(err => {
                    reject(err)
                })
        })
    }

}

module.exports = CustomerCart;