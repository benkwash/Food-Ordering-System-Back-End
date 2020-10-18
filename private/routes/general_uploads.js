/**
 * GENERAL UPLOADS ROUTES
 * ALL UPLOADS WILL BE DONE USING FIREBASE STORAGE
 */
var validate = require('../functions/validate');
var FrontEndResponse = new (require("../functions/serverResponseFormat"))();
var Promise = require("bluebird");

var _ = require('lodash');
var multer = require('multer');
var crypto = require('crypto');
var fs = require('fs');
const path = require('path');

var fileName=""
// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
// var firebase = require("firebase/app");
// require('firebase/storage');


var admin = require("firebase-admin");
const { date } = require('../functions/validate');

var serviceAccount =
{
    "type": "service_account",
    "project_id": "ait-project-5a1f8",
    "private_key_id": "7a8ced85ce311dcffd4c9a685bb6e71ddedd8d9f",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC4PuA/rpO9LAoS\nH+7Bxuqu5ZCu3wGTccsfmEmi5oXHhN/Y89X8vbweATHuL+jWw5QvN7+NZZP8kZIX\nvK7W/1HCvjzPmap1nFFyBljj2J9eolj5HPsdqEtbe6Xo0C8WmzGZUhThNDnYew+V\nteHtgNhmGhMC0roPqvjftaplPaDRwwwNQzn7KQndUWvsGcr1jjClTkNtxYX/WFbF\nfx0tlOWJ+jevIuG/WQkfp1fIfriESQ5jduhW4Z76o7Xk6+cuQmW/11p8etof3wtt\nhLjDeV/EI7WNuAjkRh6+4c0T57+SYeql0dUifaHZ99l4V63R9/Nxi50p0YV/AuOY\nr9ve5yi9AgMBAAECggEAEfdaTrDAtKsICwm/cniUh0bY0PSWEWwAmVge9hpHOVQl\nBTbhyv+FdIzmnYoLyRrRPGQnSFZ7aR7uLA+4zOZLcWizmAWCsG1J0+Cikl/xSn0c\n8qMiKZuGSFQfsuV6HK44K/HrxKTJxJOwyrHYZ3HaUuUqrWp3EkgNyg12TDZc6ZdS\nayRe/PqckWNGq+N0kwHGNqPqqKJEiBNS9IDuLlsAtYOLdSo7pNiabvEAy/S8XwDZ\n7eroAjk3XfUwkI5oJ3B0axp1XochiMo51MTd3598D+NpsE2+U+uhLNUZQaWyDQL6\n9oQGWFJppVRYSZZqMUUxOLXJK1pqT6rC5qLvCxuR0QKBgQDh/9k7TuIxbF/pZygn\ntdeNbTrCYg0ZNTcN9H/PxdQaouYii0hff36fn/J7y9HN2ocpCr0DttqTUmCYucF5\nURVdJr5638NgfaDkmbSHec2JDLmmC+ZR2sFsoUwCHKOGrflZouNNVc1ocnUnRyZz\nFT3MEa1JuFKZRqAZF/eeQuLkDwKBgQDQtBsFZvA0M6IxGcTp+Tkt26SSAi0U8OmP\n3DfdN4dcDbzuEWmQp2haxo1mH5kx3ufw026BjjFIlEOZtQIFla/zQFG8zU0GKW+q\na2Sfj/WcvKttGE0mVTr/b79RBl7VR1aRYPnfYU0spj4NIKImSxe8vi3VWOPNo5e5\nuqaZ4CvqcwKBgGASt3Iy8o04GP3L0JIxB1Uj3hrMO+0/ZgwUqFDXNHeuUE7XDwkp\n1dZd1GM0Hhh4kYSs//UYQormNhI2xTyhb4eN9OOfRBs8zKzhepEtAmcEdddUr7CU\nYi2f1AQB0LJsOtgUGrTBiPSh05PC92Fs4jxiN1xjcxmdoGmKesVYgcOZAoGBAMZB\nUSngj24HXpumDxj0VwzpCXxp9Mlf0X+HgsnyZfNcWY0NnWp8nPUeiFPq0Gw/g7WS\nI/eOS+LWdSEegb0sZOh+wSbJH9IqqpkJS50H9BngYDhSTXeMn27niKY/lvajveh8\nZuF8XQN9KJTv2xjlXLc/Merpdf1y2j7kwD6MZSthAoGBAM7E2eM/JTcxsNymX1Ya\nc3lNP9gVDDJfK3f2nsnpJMiqcNsJe+c9ICKirXMuft8rlffTJQmC/qfIaq90ISqa\nB/YDUYZx+kzM32lBc5SAADnw2jYFWtzcARfYLA0SjAV5YLaqqgUPopQP/0snSJ7c\nALJiGJk5OsI+DXPkLj/uouXY\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-xf1eu@ait-project-5a1f8.iam.gserviceaccount.com",
    "client_id": "103108506528965042763",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xf1eu%40ait-project-5a1f8.iam.gserviceaccount.com"
}


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ait-project-5a1f8.firebaseio.com"
});

const bucketName = "ait-project-5a1f8.appspot.com"
const bucket = admin.storage().bucket(bucketName);

//function for generating new random & unique file name(upload name)
var randomFileNameGenerator = function (userID,) {
    return new Promise(function (resolve, reject) {
        //eg: fileName = "xxxxxxxxxxxxxxxxxxxxxxxxx_XXXXXXXXX"
        let fileName = userID + "_" + Date.now();

        //if there's an error, use the original name else return the new name
        crypto.randomBytes(8, (err, buf) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(fileName + "_" + buf.toString('hex'));
            }
        });
    });
}


/**
 * Multer upload parameters
 * storage size:<11mb
 * field name character size: < 100characters
 */
var upload = multer({
    storage: multer.memoryStorage(),
    limits: { fieldNameSize: 100, fileSize: 11 * 1024 * 1024, /* no larger than 11mb*/ },
    fileFilter: function (req, file, cb) {
        //validate file and ensure it's a photo
        // The function should call `cb` with a boolean
        // to indicate if the file should be accepted
        if (!validate.image(file.originalname)) {
            // To reject this file pass `false`
            cb("A valid image is required.", null); //return error msg
        }

        // To accept the file pass `true`
        cb(null, true);
    }
}).single('photo');

//export router
module.exports = function (app, express) {
    var router = express.Router();

    /**
    * ===================================================
    *  UPLOAD USER PHOTO
    *  be it school logo,student|staff profile photo etc
	* ===================================================
    */
    router.post('/photo', function (req, res, next) {
        //create a new response object
        let response = FrontEndResponse.getNewFrontEndResponse();

        //set the token
        response.data.token = (req.token) ? req.token : null;

        //form entities
        let formInfo = { error: "", valid: true };

        //catch errors specifically from multer, 
        upload(req, res, function (err, result) {
            //validation error
            if (err) {
                formInfo.error = err;
                formInfo.valid = false;
            }//end of if
            else {
                //multer will return true if no image was uploaded
                //so check for the existence of an image
                if (_.isEmpty(req.file)) {
                    formInfo.valid = false;
                    formInfo.error = "No image was provided";
                }
            }//end of else

            //photo was uploaded and is okay
            if (formInfo.valid) {
                //IMAGES ADDED ARE VALID AND CAN BE USED
                //generate a random unique name for the file
                let newFileName = "";

                randomFileNameGenerator(req.userID)
                    .then(function (newName) {
                       newFileName = newName;
                    }).catch(function (err) {
                        //if an error is encountered, use the original file name
                        newFileName = req.file.originalName;
                    }).finally(() => {
                        // Create a new blob in the bucket and upload the file data.
                        //use the newly generated file name
                        // const blob = eositStorageBucket.file(newFileName);
                        const blob = bucket.file(newFileName);

                        const blobStream = blob.createWriteStream({
                            resumable: false,
                            metadata: {
                                contentType: req.file.mimetype,
                                metadata: {
                                    custom: 'metadata'
                                }
                            }
                        });

                        // on error, jump to error handler
                        blobStream.on('error', err => {
                            // console.log(err)
                            //construct response
                            response.response = "error";      //set response message
                            response.msg = "Image upload failed";
                            response.status = 500;			//set status message  

                            //send response
                            res.status(200);
                            res.json(response);
                        });

                        //on successful data upload
                        blobStream.on('finish', () => {
                            //after successful upload, new photoname should be in filename
                            //the file name should be returned back to the client
                            //fields to be update
                            let newPhoto = blob.name;

                            //construct response
                            response.response = "okay";
                            response.status = 200;

                            //set response other field
                            response.data.other = { isSaved: true, newPhoto: newPhoto };

                            //send response
                            res.status(200);
                            res.json(response);
                        });

                        // end stream(file upload)
                        blobStream.end(req.file.buffer);

                    });//end of finally promise block
            }
            else {
                //invalid form or problem in uploading form
                //validation stuffs
                response.response = "form";
                response.status = 200;
                response.msg = "Problem with upload." + formInfo.error;

                //render json
                res.status(200);
                res.json(response);
            }//end of else validation
        }); //end of image upload
    });//end of router

    return router;
}









