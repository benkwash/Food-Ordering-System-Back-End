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

    /**
     * save new order/cart information
     * @param {Object} cartInfo -order information/object
     * @return {Promise} - promise(mongoose doc)
     */
    saveNewCartInfo(cartInfo) {

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

    /**
     * This method queries for an order detail..
     * queried by a restaurant
     *  @param {String} id  -order doc object id
     *  @param {String} restaurantID 
     *  @return {Promise} - promise(mongoose doc/error)
     */
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

    /**
     * This method queries for an order detail
     * queried by a customer
     *  @param {String} orderID  -order doc object id
     *  @return {Promise} - promise(mongoose doc/error)
     */
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


    /**
     * This method queries for all customer orders
     *  @param {String} customerID  -customer id
     *  @param {String} filter -active or completed 
     *  @return {Promise} - promise(mongoose doc/error)
     */
    getCustomerOrders(customerID, filter) {
        let that = this;

        let query = {
            customerID: customerID
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

    /**
     * This method queries for all restaurant orders
     *  @param {String} resID -restaurantid 
     *  @return {Promise} - promise(mongoose doc/error)
     */
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

    /**
     * This method queries for all and filters restaurant orders
     *  @param {String} resID  -restaurant id
     *  @param {String} mode -active/wating/completed
     *  @return {Promise} - promise(mongoose doc/error)
     */
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

    /**
     * This method queries for all orders with the delivery option
     *  @param {String} resID  -restaurant id
     *  @param {String} staffID 
     *  @param {String} filter  -active,waiting,delivered
     *  @return {Promise} - promise(mongoose doc/error)
     */
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

    /**
     * This method queries for all orders with delivery option.
     * used by staff
     *  @param {String} resID
     *  @param {String} staffID 
     *  @param {String} filter -active,waiting,delivered
     *  @return {Promise} - promise(mongoose doc/error)
     */
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


    /**
     * This method updates an order info
     *  @param {String} cartID
     *  @param {Object} update 
     *  @return {Promise} - promise(mongoose doc/error)
     */
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

    /**
     * This method queries for order ratings
     *  @param {String} resID
     *  @return {Promise} - promise(mongoose doc/error)
     */
    getRating(resID) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.cartInfoModel.aggregate([{
                    $match: {
                        restaurantID: mongoose.Types.ObjectId(resID),
                        "review.rating": { $ne: null } //not nulll
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

    /**
     * This method queries for restaurant order ratings breakdown.
     *  @param {String} resID
     *  @return {Promise} - promise(mongoose doc/error)
     */
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

    /**
     * This method queries for an order detail
     *  @param {String} resID  -order doc object id
     *  @param {String} mode 
     *  @return {Promise} - promise(mongoose doc/error)
     */
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


    /**
     * This method gets all reviews of a restaurant
     *  @param {String} resID
     *  @return {Promise} - promise(mongoose doc/error)
     */
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


    /**
     * This method get all revenue/accounts for a restaurant for the current year
     *  @param {String} resIDs
     *  @return {Promise} - promise(mongoose doc/error)
     */
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

    /**
     * This method queries for account details for the past n days
     *  @param {String} resID
     *  @param {Date} date 
     *  @return {Promise} - promise(mongoose doc/error)
     */
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