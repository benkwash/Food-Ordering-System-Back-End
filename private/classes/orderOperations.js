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
        this.resConfigDriver = null;
        this.resInfoDriver = new resinfo(connection);
        this.resMenuDriver = new resmenu(connection);
        this.resConfigDriver = new resconfig(connection);
        this.empInfoDriver = new empInfo(connection);

    }



    //other functions

    getRestaurantOrders() {
        let that = this;

        return this.cartDriver.getRestaurantOrders(this.restaurantID)
            .then(resOrders => {
                if (_.isNull(resOrders) || _.isEmpty(resOrders)) {
                    return []
                } else {
                    resOrders.forEach((doc, index) => {
                        //assign customer namee
                        doc['customerName'] = doc.customerInfo[0].fName + " " + doc.customerInfo[0].lName //naturally only doc should be here
                        delete doc.customerInfo; //delete customer info

                        doc['orderID'] = doc._id.toString().substring(0, 10); //order id ==first 10 characters of mongoose obj id


                    });



                    return resOrders;
                }
            })
    }

    getRestaurantOrdersFilter(orderOption) {
        let that = this;

        return this.cartDriver.getRestaurantOrdersFiltered(this.restaurantID, orderOption)
            .then(resOrders => {
                if (_.isNull(resOrders) || _.isEmpty(resOrders)) {
                    return []
                } else {
                    resOrders.forEach((doc, index) => {
                        //assign customer namee
                        doc['customerName'] = doc.customerInfo[0].fName + " " + doc.customerInfo[0].lName //naturally only doc should be here
                        delete doc.customerInfo; //delete customer info

                        // doc['orderID'] = doc._id.toString().substring(0, 10); //order id ==first 10 characters of mongoose obj id


                    });
                    return resOrders;
                }
            })
    }

    getOneOrderDetail(cartID) {
        let that = this;

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

    //getDeliveryRes
    getRestaurantDeliveries(accountType, filter) {
        let that = this;
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

                        //grab assigned stadff name
                        if (!_.isEmpty(doc.deliveryPersonInfo)) {
                            doc['deliveryPersonName'] = doc.deliveryPersonInfo[0].fName + " " + doc.deliveryPersonInfo[0].lName
                        }
                        delete doc.deliveryPersonInfo; //delete staff info
                        doc['orderID'] = doc._id.toString().substring(0, 10); //order id ==first 10 characters of mongoose obj id
                    });
                    //



                    return resOrders;
                }
            })
    }

    processOrder(cartID) {

        let that = this;
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
    getDeliveryStaff() {
        let that = this;

        return this.empInfoDriver.getDeliveryStaff(this.restaurantID)
            .then(staff => {
                if (_.isEmpty(staff) || _.isNull(staff)) {
                    return [];
                } else {
                    return staff;
                }
            })

    }


    assignDeliveryStaff(cartID, staffID, accountType) {
        let that = this;

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