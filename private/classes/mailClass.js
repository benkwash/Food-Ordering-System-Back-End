var mailgun = require("mailgun-js");

var api_key = 'key-ad57d22cb9e77bf968f04e04e1b5f5fc';
var domain = "mg.eosit.eddgen.com";

class MailClass {
    constructor() {
        //try sending mail at least three times
        this.mailSender = mailgun({ apiKey: api_key, domain: domain, retry: 3 });

        //other parameters
        this.senderEmail = 'comeCho Support <comeCho@benkwash.com>';
    }

    sendAccountVerificationMail(recipientEmail, code = null) {
        const subject = "comeCho Account Verification";
        const messageType = "html";

        //generate message body html
        let body = '<div><b>comeCho</b> Verification Code: <b>' + code + '</b></div>';

        //send message and return
        return this.sendMail(recipientEmail, subject, body, messageType);
        // return true;
    }

    sendRecoveryCodeMail(recipientEmail, code = null) {
        const subject = "comeCho Account Recovery";
        const messageType = "html";

        //generate message body html
        let body = '<div><b>comeCho</b> Recovery Code: <b>' + code + '</b></div>';

        //send message and return
        return this.sendMail(recipientEmail, subject, body, messageType);
    }

    /**
     * Send a mail to a receipent including the subject,body and body type
     * body type  defaults to text
     * @param {String} recipientEmail 
     * @param {String} subject 
     * @param {String} messageBody 
     * @param {String} messageType - either text or html
     * @return {Promise}
     */
    sendMail(recipientEmail, subject, messageBody, messageType = "text", otherInfo = {}) {
        //default mail data.
        let mailData = {
            from: this.senderEmail,
            to: recipientEmail,
            subject: subject
        };

        //add message body
        if (messageType === "text") {
            mailData["text"] = messageBody;
        } else if (messageType === "html") {
            mailData["html"] = messageBody
        }

        //merge other info into mail data
        if (otherInfo) {
            mailData = Object.assign(mailData, otherInfo);
        }

        let that = this;
        return new Promise(function(resolve, reject) {
            //send the message
            that.mailSender.messages().send(mailData, function(error, body) {
                //message is successfully sent when an id parameter exist on the body
                if (body && body.id) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    /**
     * Send messages to all developers
     */
    sendMailToDevelopers(subject, logMsg) {
        //dev emails
        //emails should be comma separated
        let devEmails = "benjaminkwashie@gmail.com";

        return this.sendMail(devEmails, subject, logMsg)
            .then(function(sentMail) {
                if (sentMail.id) {
                    //success
                    return "true";
                }
            }).catch(function(error) {
                // console.log('error from mailing log messages')
                // console.log(error)
            });
    }
}

module.exports = MailClass;