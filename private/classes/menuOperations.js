const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');

//model drivers
const menuModel = require("../model-drivers/restaurant-menu");


class MenuOperations {

    constructor(connection, userID = null, resID = null) {
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


    /**
     * add new menu
     * @param {Object} menuData -{new menu info}
     * @return {Promise} - Object or Boolean(false)
     */
    saveMenu(menuData) {

        let menu = menuData;
        menu['restaurantID'] = this.restaurantID //add restaurant id to menu info

        return this.menuDriver.saveNewMenu(menu)
            .then((returned) => {
                if (!_.isNull(returned)) {
                    return returned;
                } else {
                    return false;
                }
            })

    }

    /**
     * retrieve all menu of a restaurant
     * @param {}
     * @return {Promise} - Object or Boolean(false)
     */
    getAllMenu() {

        return this.menuDriver.retrieveAllMenu(this.restaurantID)
            .then((response) => {
                if (!_.isNull(response)) {
                    return response;
                } else {
                    return false;
                }
            })
    }

    /**
     * update restaurant menu
     * @param {Object} menu -{menu information}
     * @return {Promise} - Object or Boolean(false)
     */
    updateMenu(menu) {

        return this.menuDriver.updateMenu(menu._id, menu)
            .then((returned) => {
                if (!_.isNull(returned)) {
                    return returned;
                } else {
                    return false
                }
            })
    }

    /**
     * delete restaurant menu
     * @param {String} menuID
     * @return {Promise} - Object {success:true|false}
     */
    deleteMenu(menuID) {

        let update = {
            _id: menuID,
            isActive: false
                //not really deleting..just hiding it from any new queries..
                //for minnig purposes .abi you barb
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

    /**
     * get one menu details
     * @param {String} menuID
     * @return {Promise} - Object or Boolean(false)
     */
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