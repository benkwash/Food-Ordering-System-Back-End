/**
 * This is a class for token creation and validation.
 * Token expires in 1hr.
 * This means 1hr of inactivity i.e when no request is made to the server
 * Token is always refreshed in 1hr.
 */
var jwt = require("jsonwebtoken");
var Promise = require("bluebird");
var crypto = require('crypto');

class TokenAuth {
    //payload is an obj/json
    constructor() {
        //require necessary vars
        this.secretKey = null;
        this.payload = null;
        this.token = null;
        this.options = {};

        // will be used after token refresh has been implemented.
        // //use this options by default when signing token unless options is provided
        // //along side the payload in setPayload
        // this.options = {
        //     expiresIn: "1h", //1h => 60s * 60mins = Ihr
        // };

        //set jwt config
        this.config();
    }


    /**
     * Sign/generate the token given the payload
     * @param {} - none
     * @return {String} - token(string);
     */
    signToken() {
        //jwt takes payload,secret key,options, and an optional callback;
        this.token = jwt.sign(this.payload, this.secretKey, this.options);

        return this.token;
    }

    /**
     * Verify the token provided
     * @param - none
     * @return {Promise} - 
     */
    verifyToken(cb) {
        let that = this;

        //return a promise instead
        return new Promise(function(resolve, reject) {
            //before verifying the token, the token must be first set
            //verify the token
            jwt.verify(that.token, that.secretKey, function(err, decoded) {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });

        });
    }


    /**
     * Set config parameters of jwt
     * @param {} - none
     * @return {} - void
     */
    config() {
        //set secret key for token signing
        this.secretKey = "someSecretKeyBiOOooooyouKnowWhatImSayingHeHeHeeeeelols";
    }

    /**
     * Set Payload for token(before token signIn)
     * @param {Object} - payload {data to be signed}
     * @param {Object} - token sign options set to nothing by default
     * @return {} - void
     */
    setPayload(payload, options = {}) {
        this.payload = payload;
        this.options = options;
    }

    /**
     * Retrieve the set payload 
     * @param {} 
     * @return {Object} data
     */
    getPayload() {
        return this.payload;
    }

    /**
     * Set token
     * @param {String} token signed token
     * @return {} - void
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Retrieve the signed token
     * @param {} - json/obj payload
     * @return {String} - void
     */
    getToken() {
        return this.token;
    }

    /**
     * Generate random text as an xsrf value token to be used for signing
     * before getting xsrf token
     */
    generateRandomXSRFText() {
        return new Promise(function(resolve, reject) {
            crypto.randomBytes(8, (err, buf) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buf.toString('hex'));
                }
            });
        })
    }

} //end of class

//export class
module.exports = TokenAuth;