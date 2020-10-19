const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');

//model drivers
const cart = require("../model-drivers/customer-cart");
const resconfig = require("../model-drivers/restaurant-configure");
const resinfo = require("../model-drivers/restaurant-Information");
const resmenu = require("../model-drivers/restaurant-menu");

const funcClass = require("../functions/functionsClass");
const { response } = require('express');

class CustomerOperations {

    constructor(connection) {

        this.connection = connection;

        this.cartDriver = new cart(connection);
        this.resConfigDriver = null;
        this.resInfoDriver = new resinfo(connection);
        this.resMenuDriver = new resmenu(connection);

        // this.menuModelDriver();
        this.setResConfigDriver();

    }

    setResConfigDriver() {
        this.resConfigDriver = new resconfig(this.connection)
    }


    /**
     * get all restaurants
     * data to return when a customer searches for vendors within their location
     * @param {String} region
     * @param {String} city
     * @param {Number} pageNumber
     * @param {String} option -either delivery,pickup or table
     * @return {Promise} - Object -mapped
     */
    //params region &&city
    getRestaurants(region, city, pageNumber, option) {

        //gotta clean up this code later
        return this.resConfigDriver.getRestaurants(region, city, pageNumber, option)
            .then((data) => {
                if (!_.isNull(data) || !_.isEmpty(data)) {
                    let mapped = data.map(obj => {

                        let citywr = "";
                        for (const c of city) {
                            citywr += (c + '\\s*')
                        } //add white spaces for regex
                        let cityRegex = new RegExp(citywr, 'i');
                        let dCost = 0; //delivery cost
                        let dCity = "";
                        let tCost = obj.costPerTable ? obj.costPerTable : 0; //table reservation cost
                        obj.cities.forEach((x, index) => {
                            if (x.city.match(cityRegex)) {
                                dCost = obj.cities[index].deliveryCost;
                                dCity = obj.cities[index].city;
                            }
                        })
                        return {
                            restaurantName: obj.restaurantInformation[0].name,
                            region: obj.region,
                            currentCity: obj.cities[0].city,
                            dCity: dCity,
                            dCost: dCost,
                            resID: obj.restaurantID,
                            review: obj.review,
                            picture: obj.picture,
                            tCost: tCost
                        }
                    })
                    return mapped;
                } else {
                    return [];
                }
            });
    }

    /**
     * get all menu of a specific restaurant
     * @param {Sting} resID -restaurant ID
     * @param {String} city -city queried by the user
     * @return {Promise} - Object
     */
    getAllRestaurantMenu(resID, city) {
        let that = this;

        //data to return
        let dCost = null;
        let dCity = null;
        let menu = null;
        let tReservation = false;
        let tOptions = {
            costPerTable: null,
            maximumChairPerTable: null,
            totalTables: null,
            totalChairs: null
        }
        let picture = null;
        let restID = null
        let pickup = false;
        let delivery = false;

        //get res config info
        return this.resConfigDriver.getConfigInfo(resID)
            .then((returned) => {
                if (_.isNull(returned) || _.isEmpty(returned)) {
                    return [];
                } else {
                    //this could be cleaned up if i used google geo services
                    //aint paying for it obviously, cos this be school project and its damn expensive for me

                    //algo..a restaurant has/can deliver to many cities
                    //first city in the cities array is the actual location of the restaurant
                    //user searches for restaurants within their location
                    //algo matches city in the cities array and grabs delivery cost of delivery to that location
                    //a restaurant can be in accra but delivers to kasoa.delivery might be free in accra but not to kasoa
                    //where a user searches from will determine the location and delivery cost
                    //get cities
                    let obj = returned.cities;
                    obj.forEach((x, index) => {
                            if (x.city == city) {
                                dCost = x.deliveryCost;
                                dCity = x.city;
                            }
                        })
                        //if there is an option to reserve a table
                    if (returned.tableReservation) {
                        tReservation = true;
                        tOptions.costPerTable = returned.costPerTable;
                        tOptions.maximumChairPerTable = returned.maximumChairPerTable;
                        tOptions.totalChairs = returned.totalChairs
                        tOptions.totalTables = returned.totalTables
                    }
                    if (returned.pickup) pickup = true;
                    if (returned.delivery) delivery = true;
                    picture = returned.picture ? returned.picture : null;
                    restID = returned.restaurantID

                    //retrieve menu of the restaurant
                    return that.resMenuDriver.retrieveAllMenu(resID)
                }
            }).then((menus) => {
                if (_.isNull(menus) || _.isEmpty(menus)) {
                    menu = [];
                } else {
                    menu = menus; //menu isnt empty
                }
                //get resaurant info...this will be cleaned up later in the query
                return that.resInfoDriver.getRestaurantInfo(resID);
            }).then(resInformation => {
                if (_.isNull(resInformation) || _.isEmpty(resInformation)) {
                    return []
                } else {
                    return {
                        resName: resInformation.name,
                        menu: menu,
                        dCity: dCity,
                        dCost: dCost,
                        tReservation: tReservation,
                        tableOptions: tOptions,
                        pickup: pickup,
                        delivery: delivery,
                        picture: picture,
                        resID: restID
                    }
                }
            });
    }

    /**
     * save order information
     * new order
     * @param {String} id -customer id
     * @param {Object} orderInfo -order object
     * @return {Promise} - Object {success:true|false}
     */
    saveOrderCart(id, orderInfo) {
        let that = this;

        orderInfo['customerID'] = id;

        let funcOrderID = new funcClass()
        return this.cartDriver.saveNewCartInfo(orderInfo)
            .then(savedInfo => {
                if (_.isEmpty(savedInfo) || _.isNull(savedInfo)) {
                    return { success: false };
                } else {
                    //after order has been save...use the generated mongo doc id to calculate the order ID..
                    //basically the first ten characters of the mongo id
                    let orderID = funcOrderID.returnOrderID(savedInfo._id);
                    //update order ID
                    return that.cartDriver.updateCartInfo(savedInfo._id, { orderID: orderID });
                }
            }).then(response => {
                if (_.isEmpty(response) || _.isNull(response)) {
                    return { success: false };
                } else {
                    return { success: true };
                }
            })
    }

    /**
     * get customer's orders
     * @param {String} id -customer id
     * @param {String} filter -all,pickup,table,delivery
     * @return {Promise} - Object -orders
     */
    getCustomerOrders(id, filter) {

        //get orders
        return this.cartDriver.getCustomerOrders(id, filter)
            .then(orders => {
                if (_.isNull(orders) || _.isEmpty(orders)) {
                    return []
                } else {
                    //loop through and determine/get status of the order
                    orders.forEach((doc, index) => {
                        let status = null;
                        let action = null
                        if (doc.cancelled.cancelled) {
                            status = 'cancelled'
                        } else if (doc.completed.completed && doc.customerConfirmation) {
                            //if order has been completed
                            if (doc.mode == "delivery") status = 'delivered';
                            else if (doc.mode == "pickup") status = 'picked up';
                            else if (doc.mode == "table") status = 'completed';
                        } else if (doc.deliveryPerson.deliveryPerson && doc.processing && !doc.completed.completed) {
                            //if order isnt completed and being assigned a delivery person
                            status = 'in transit'
                        } else if (doc.deliveryPerson.deliveryPerson == null && doc.processing && !doc.completed.completed) {
                            status = "processing"
                        }

                        if (!doc.processing && !doc.cancelled.cancelled) {
                            status = 'pending'
                            action = 'cancel'
                        } else if (doc.completed.completed && !doc.customerConfirmation) {
                            // if (order.mode == "delivery") action = 'delivered';
                            // else if (order.mode == "pickup") action = 'delivered';
                            // else if (order.mode == "table") action = 'completed';
                            action = "confirm"
                        }
                        orders[index]['status'] = status;
                        orders[index]['action'] = action;
                        delete orders[index].table;
                        delete orders[index].review;
                        delete orders[index].orders;
                        delete orders[index].customerID;
                        delete orders[index].cancelled;
                        delete orders[index].completed;
                        delete orders[index].deliveryPerson;
                        delete orders[index].deliveryLocation;
                        delete orders[index].restaurantID;
                        delete orders[index].customerConfirmation;
                        delete orders[index].deliveryFee;
                    })
                    return orders //return order
                }
            })
    }

    /**
     * get one order detail
     * @param {String} order -object id
     * @return {Promise} - Object or Boolean(false)
     */
    getOrderDetail(cartID) {
        return this.cartDriver.retrieveOneOrderCustomer(cartID)
            .then(response => {
                if (!_.isNull(response)) return response;
                else return false
            })
    }

    /**
     * update an order info
     * @param {String} order -object id
     * @param {Object} update
     * @return {Promise} - Object or Boolean(false)
     */
    updateCustomerOrder(cartID, update) {

        let success = false
        return this.cartDriver.updateCartInfo(cartID, update)
            .then(res => {
                if (!_.isNull(res) || !_.isEmpty(res)) success = true;
                return success;
            })
    }

    /**
     * reply to comments on a order review
     * @param {String} reply
     * @param {String} userID
     * @return {Promise} - Object or Boolean(false)
     */
    sendReply(reply, userID) {
        let _id = reply._id;
        delete reply._id;

        reply['by'] = userID;

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

    /**
     * get customer's orders
     * @param {String} order -object id
     * @param {Object} update
     * @return {Promise} - Object or Boolean(false)
     */
    confirmOrder(cartID, update) {
        //algo
        //update order confirmation...might come with rating which is optional
        //after upate, get rating from all orders with ratings
        //update in restaurant info.
        //i think ebe efficient pass having to calculate rating each time a restaurant search is made.
        //rating wwill be shown when a restaurant is searched for.

        let that = this;

        let success = false;
        let restaurantID = null;

        return this.cartDriver.updateCartInfo(cartID, update)
            .then(returned => {
                if (!_.isNull(returned) || !_.isEmpty(returned)) {
                    success = true;
                    restaurantID = returned.restaurantID
                    return that.cartDriver.getRating(restaurantID)
                } else return false;
            }).then(ratingInfo => {
                if (!_.isNull(ratingInfo) || success) {
                    if (!_.isEmpty(ratingInfo)) {
                        let rating = ratingInfo[0]; //an array is returned with the first doc being the value
                        let resRating = rating.average; // get all restaurant rating average
                        let resTotal = rating.total; //get total number of rating/numb of people who have rated
                        let update = {
                                review: {
                                    rating: resRating,
                                    outOf: resTotal
                                }
                            } //update in restaurant info
                        return this.resConfigDriver.updateConfigInfo(restaurantID, update);
                    } else return true; //if returned is an empty array, no rating has been made

                } else return false;
            }).then(update => {
                if (!_.isNull(update) || !_.isEmpty(update) || success) {
                    success = true;
                }

                return success
            })


    }
}

module.exports = CustomerOperations;