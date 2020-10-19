const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');

//model drivers
const cart = require("../model-drivers/customer-cart");
const resconfig = require("../model-drivers/restaurant-configure");
const resinfo = require("../model-drivers/restaurant-Information");
const resmenu = require("../model-drivers/restaurant-menu");

const empInfo = require("../model-drivers/employee-information")



class OrderOperations {

    constructor(connection, userID, restaurantID) {

        this.connection = connection;
        this.userID = userID;
        this.restaurantID = restaurantID;

        this.cartDriver = new cart(connection);
        // this.resConfigDriver = null;
        // this.resInfoDriver = new resinfo(connection);
        // this.resMenuDriver = new resmenu(connection);
        // this.resConfigDriver = new resconfig(connection);
        this.empInfoDriver = new empInfo(connection);

    }

    //other functions


    /**
     * get restaurant orders
     * @param {} 
     * @return {Promise} - Object or Boolean(false)
     */
    getRestaurantOrders() {

        return this.cartDriver.getRestaurantOrders(this.restaurantID)
            .then(resOrders => {
                if (_.isNull(resOrders) || _.isEmpty(resOrders)) {
                    return []
                } else {
                    resOrders.forEach((doc, index) => {
                        //get customer namee
                        doc['customerName'] = doc.customerInfo[0].fName + " " + doc.customerInfo[0].lName //naturally only doc should be here
                        delete doc.customerInfo; //delete customer info

                        // doc['orderID'] = doc._id.toString().substring(0, 10); 
                        //order id ==first 10 characters of mongoose obj id
                    });
                    return resOrders;
                }
            })
    }

    /**
     * get filtered restaurant orders
     * @param {String} orderOption -{filter..}
     * @return {Promise} - Object
     */
    getRestaurantOrdersFilter(orderOption) {

        return this.cartDriver.getRestaurantOrdersFiltered(this.restaurantID, orderOption)
            .then(resOrders => {
                if (_.isNull(resOrders) || _.isEmpty(resOrders)) {
                    return []
                } else {
                    resOrders.forEach((doc, index) => {
                        //assign customer namee
                        doc['customerName'] = doc.customerInfo[0].fName + " " + doc.customerInfo[0].lName //naturally only doc should be here
                        delete doc.customerInfo; //delete customer info

                        // doc['orderID'] = doc._id.toString().substring(0, 10); 
                        //order id ==first 10 characters of mongoose obj id
                    });
                    return resOrders;
                }
            })
    }

    /**
     * get one order detail
     * @param {String} cartID -(order object id)
     * @return {Promise} - Object
     */
    getOneOrderDetail(cartID) {

        return this.cartDriver.retrieveOneOrderDetail(cartID, this.restaurantID)
            .then(retrieved => {
                if (!_.isEmpty(retrieved)) {
                    let order = retrieved[0]; //only one doc should be returned
                    order["customerName"] = order.customerInfo[0].fName + " " + order.customerInfo[0].lName
                        //only one customer info should be returned
                        //delete customer info
                    delete order.customerInfo;
                    return order;
                } else return {};
            })
    }

    /**
     * get all orders with delivery option
     * @param {String} accountType
     * @param {String} filter
     * @return {Promise} - Object (restaurant orders)
     */
    getRestaurantDeliveries(accountType, filter) {
        let query = ''
        if (accountType == "admin") query = "getDeliveryRes"
        else query = "getDeliveryResStaff"
        return this.cartDriver[query](this.restaurantID, this.userID, filter)
            .then(resOrders => {
                if (_.isNull(resOrders) || _.isEmpty(resOrders)) {
                    return []
                } else {
                    resOrders.forEach((doc, index) => {
                        //assign customer namee
                        doc['customerName'] = doc.customerInfo[0].fName + " " + doc.customerInfo[0].lName //naturally only doc should be queried
                        delete doc.customerInfo; //delete customer info

                        //grab assigned staff name
                        if (!_.isEmpty(doc.deliveryPersonInfo)) {
                            doc['deliveryPersonName'] = doc.deliveryPersonInfo[0].fName + " " + doc.deliveryPersonInfo[0].lName
                        }
                        delete doc.deliveryPersonInfo; //delete staff info
                        doc['orderID'] = doc._id.toString().substring(0, 10); //order id ==first 10 characters of mongoose obj id
                    });

                    return resOrders;
                }
            })
    }

    /**
     * process order
     * @param {String} cartID -(order object ID)
     * @return {Promise} - Booolean
     */
    processOrder(cartID) {

        let update = {
            processing: true
        }
        return this.cartDriver.updateCartInfo(cartID, update)
            .then((res) => {
                let success = false;
                if (!_.isEmpty(res)) {
                    success = true;
                }
                return success;
            })
    }

    /**
     * get all staff with delivery permissions
     * will be assigned to an order raeady for delivery
     * @param {}
     * @return {Promise} - Object or Empty array
     */
    getDeliveryStaff() {

        return this.empInfoDriver.getDeliveryStaff(this.restaurantID)
            .then(staff => {
                if (_.isEmpty(staff) || _.isNull(staff)) {
                    return [];
                } else {
                    return staff;
                }
            })
    }


    /**
     * assign staff to an order for delivery
     * @param {String} cartID -(order object id)
     * @param {String} staffid
     * @param {String} accountType
     * @return {Promise} - Object {success:true|false}
     */
    assignDeliveryStaff(cartID, staffID, accountType) {

        let update = {
            deliveryPerson: {
                deliveryPerson: mongoose.Types.ObjectId(staffID),
                accountType: accountType
            }
        }

        return this.cartDriver.updateCartInfo(cartID, update)
            .then(update => {
                if (_.isNull(update)) {
                    return { success: false }
                } else {
                    return { success: true }
                }
            })
    }

    /**
     * cancel order
     * @param {String} cartID -(order doc object id)
     * @param {String} by -(person cancelling order)
     * @param {String} reason
     * @return {Promise} - Object {success:true|false}
     */
    cancelOrder(cartID, by, reason) {
        let update = {
            cancelled: {
                cancelled: true,
                by: by, //user or restaurant
                reason: reason
            }
        }

        return this.cartDriver.updateCartInfo(cartID, update)
            .then(update => {
                if (_.isNull(update)) {
                    return { success: false }
                } else {
                    return { success: true }
                }
            })
    }

    /**
     * update order delivery status
     * @param {String} cartID -(object id)
     * @param {Boolean} completed 
     * @param {Date} time
     * @return {Promise} - Object or Boolean(false)
     */
    updateDeliveryStatus(cartID, completed, time) {
        let update = {
            completed: {
                completed: completed,
                time: time
            }
        }

        return this.cartDriver.updateCartInfo(cartID, update)
            .then(update => {
                if (_.isNull(update)) {
                    return { success: false }
                } else {
                    return { success: true }
                }
            })
    }


}

module.exports = OrderOperations;