var Promise = require("bluebird");

class RestaurantMenu {

    constructor(connection) {
        this.resMenuModel = null;
        this.connection = connection;

        this.setResMenuInfo();

    }

    //assign employeeinfo schema
    setResMenuInfo() {
        this.resMenuModel = require('../models/restaurant-menu')(this.connection);
    }

    //other functions


    /**
     * Save new restaurant information
     *  @param {Object} menuDoc
     *  @return {Promise} - promise(mongoose doc/error)
     */
    saveNewMenu(menuDoc) {

        let newMenu = new this.resMenuModel(menuDoc);

        return new Promise((resolve, reject) => {

            newMenu.save()
                .then((returned) => {
                    resolve(returned);
                }).catch((error) => {
                    reject(error);
                })
        })

    }

    /**
     * Update a restaurant's menu information
     *  @param {String} menuID
     *  @param {Object} update 
     *  @return {Promise} - promise(mongoose doc/error)
     */
    updateMenu(menuID, update) {
        let that = this;

        return new Promise((resolve, reject) => {
            that.resMenuModel.findOneAndUpdate({
                    _id: menuID
                }, update, {
                    new: true
                })
                .exec()
                .then((updatedMenu) => {
                    resolve(updatedMenu);
                }).catch((error) => {
                    reject(error);
                });

        }); //end of promise

    }

    /**
     * Retrieve all menu of a particular restaurant
     *  @param {String} restaurantID 
     *  @return {Promise} - promise(mongoose doc/error)
     */
    retrieveAllMenu(restaurantID) {
        let that = this;

        return new Promise((resolve, reject) => {
            that.resMenuModel.find({ restaurantID: restaurantID, isActive: true })
                .sort({ name: 'asc' })
                .exec()
                .then((returnedMenu) => {
                    resolve(returnedMenu);
                }).catch((error) => {
                    reject(error)
                });
        }); //end of promise

    }

    /**
     * Get details on one restaurant menu
     *  @param {String} menuID
     *  @return {Promise} - promise(mongoose doc/error)
     */
    retrieveOneMenu(menuID) {

        let that = this;
        return new Promise((resolve, reject) => {
            that.resMenuModel.findOne({ _id: menuID })
                .exec()
                .then((returnedMenu) => {
                    resolve(returnedMenu);
                }).catch((error) => {
                    reject(error);
                })
        }); //end of promise
    }

    /**
     * Delete menu info..not really delete. just hide it from future queries
     *  @param {String} menuID
     *  @return {Promise} - promise(mongoose doc/error)
     */
    deleteMenu(menuID) {

        let that = this;

        return new Promise((resolve, reject) => {
            that.resMenuModel.findOneAndUpdate({
                    _id: menuID
                }, {
                    isActive: false
                }, {
                    new: true
                }).exec()
                .lean()
                .then((updatedMenu) => {
                    resolve(updatedMenu);
                }).catch((error) => {
                    reject(error);
                });

        }); //end of promise
    }




}

module.exports = RestaurantMenu;