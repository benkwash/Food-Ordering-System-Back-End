const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');

//model drivers
const menuModel = require("../model-drivers/restaurant-menu");


class MenuOperations {

    constructor(connection, userID=null, resID=null) {
        this.userID = userID;
        this.restaurantID = resID;

        this.connection = connection;

        this.menuDriver = null;

        this.menuModelDriver();

    }

    menuModelDriver() {
        this.menuDriver = new menuModel(this.connection)
    }

    //other functions

    saveMenu(menuData) {
        let that = this;

        let menu = menuData;
        menu['restaurantID'] = this.restaurantID

        return this.menuDriver.saveNewMenu(menu)
            .then((returned) => {
                if (!_.isNull(returned)) {
                    return returned;
                } else {
                    return false;
                }
            })

    }
    getAllMenu() {
        let that = this;

        return this.menuDriver.retrieveAllMenu(this.restaurantID)
            .then((response) => {
                if (!_.isNull(response)) {
                    return response;
                } else {
                    return false;
                }

            })
    }

    updateMenu(menu) {

        let that = this;

        return this.menuDriver.updateMenu(menu._id, menu)
            .then((returned) => {
                if (!_.isNull(returned)) {
                    return returned;
                } else {
                    return false
                }

            })
    }

    deleteMenu(menuID) {

        let that = this;
        let update = {
            _id: menuID,
            isActive: false
        }

        return this.menuDriver.updateMenu(menuID, update)
            .then((returned) => {
                if (!_.isNull(returned)) {
                    return { success: true }
                } else {
                    return { success: false }
                }

            })
    }

    getOneMenu(menuID) {
        return this.menuDriver.retrieveOneMenu(menuID)
            .then(returned => {
                if (!_.isNull(returned)) {
                    return returned
                } else {
                    return false
                }
            })
    }


}

module.exports = MenuOperations