var Promise = require("bluebird");

class RestaurantConfigure {

    constructor(connection) {
        this.resConfigureModel = null;
        this.connection = connection;

        this.setResConfigureInfo();

    }

    //assign employeeinfo schema
    setResConfigureInfo() {
        this.resConfigureModel = require('../models/restaurant-configure')(this.connection);
    }



    //other functions

    saveNewConfiguration(newConfig) {

        let that = this;
        let saveConfig = new this.resConfigureModel(newConfig);

        return new Promise((resolve, reject) => {
            saveConfig.save()
                .then((savedConfig) => {
                    resolve(savedConfig);

                }).catch((err) => {
                    reject(err);
                });
        }); //end of promise

    }


    getConfigInfo(resID) {

        let that = this;

        return new Promise((resolve, reject) => {
            that.resConfigureModel.findOne({ restaurantID: resID }, '', { lean: true }).exec()
                .then((returned) => {
                    resolve(returned);
                }).catch((err) => {
                    reject(err);
                });
        }); //end of promise

    }

    // getConfigInfoAndResName(resID) {

    //     let that = this;


    //     return new Promise((resolve, reject) => {

    //         that.resConfigureModel.aggregate({
    //             $match: {
    //                 restaurantID: resID
    //             }
    //         }, {
    //             $lookup: {
    //                 from: 'RESTAURANT_INFO',
    //                 localField: 'restaurantID',
    //                 foreignField: '_id',
    //                 as: 'restaurantInformation'
    //             }
    //         }, {
    //             $limit: 10
    //         }, function(error, res) {
    //             if (error) {
    //                 reject(error)
    //             } else {
    //                 resolve(res)
    //             }
    //         })
    //     }); //end of proomise

    // }

    updateConfigInfo(resID, update) {

        let that = this;

        return new Promise((resolve, reject) => {
            that.resConfigureModel.findOneAndUpdate({ restaurantID: resID }, update, { lean: true, new: true }).exec()
                .then((updated) => {
                    resolve(updated);
                }).catch((err) => {
                    reject(err);
                });
        }); //emd of promise
    }

    getRestaurants(region, city, pageNumber, option) {

        let that = this;

        let citywr = "";
        if (city != "" || city != null) {
            for (const c of city) {
                citywr += (c + '\\s*')
            } //add white spaces for regex
        }

        let cityRegex = new RegExp(citywr, 'i');
        let queryLimit = 10;
        let querySkip = 0;

        let pageNo = pageNumber ? pageNumber : 1;

        //page number used for paginating results
        if (pageNo > 1) {
            for (var x = 1; x < pageNo; x++) {
                querySkip += queryLimit;
            }
        }
        let queryMatch = ''

        if (option == "pickup") {
            queryMatch = "findWithPickup"
        } else if (option == "table") {
            queryMatch = "findWithTable"
        } else {
            queryMatch = "findWithDelivery"
        }

        return this[queryMatch](region, cityRegex, queryLimit, querySkip)
            .then(allres => {
                return allres
            })
    }

    findWithDelivery(region, cityRegex, queryLimit, querySkip) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.resConfigureModel.aggregate([{
                $match: {
                    region: region,
                    delivery: true,
                    "cities": {
                        $elemMatch: {
                            city: cityRegex
                        }
                    }
                }
            }, {
                $lookup: {
                    from: 'RESTAURANT_INFO',
                    localField: 'restaurantID',
                    foreignField: '_id',
                    as: 'restaurantInformation'
                }
            }, {
                $limit: queryLimit
            }, {
                $skip: querySkip
            }], function (error, res) {
                if (error) {
                    reject(error)
                } else {
                    resolve(res)
                }
            })
        }); //end of proomise
    }

    findWithPickup(region, cityRegex, queryLimit, querySkip) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.resConfigureModel.aggregate([{
                $match: {
                    region: region,
                    pickup: true,
                    "cities": {
                        $elemMatch: {
                            city: cityRegex
                        }
                    }
                }
            }, {
                $lookup: {
                    from: 'RESTAURANT_INFO',
                    localField: 'restaurantID',
                    foreignField: '_id',
                    as: 'restaurantInformation'
                }
            }, {
                $limit: queryLimit
            }, {
                $skip: querySkip
            }], function (error, res) {
                if (error) {
                    reject(error)
                } else {
                    resolve(res)
                }
            })
        }); //end of proomise
    }

    findWithTable(region, cityRegex, queryLimit, querySkip) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.resConfigureModel.aggregate([{
                $match: {
                    region: region,
                    tableReservation: true,
                    "cities": {
                        $elemMatch: {
                            city: cityRegex
                        }
                    }
                }
            }, {
                $lookup: {
                    from: 'RESTAURANT_INFO',
                    localField: 'restaurantID',
                    foreignField: '_id',
                    as: 'restaurantInformation'
                }
            }, {
                $limit: queryLimit
            }, {
                $skip: querySkip
            }], function (error, res) {
                if (error) {
                    reject(error)
                } else {
                    resolve(res)
                }
            })
        }); //end of proomise
    }




    // getRestaurantInfo(resID){
    //     let that=this;

    //     return new Promise((resolve,reject)=>{

    //         that.resConfigureModel.
    //     })
    // }


    //rating formula
    //((rating*total numbr)+new rating)/total numbr+1


}

module.exports = RestaurantConfigure;