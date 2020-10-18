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


    saveNewMenu(menuDoc) {

        let that = this;
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