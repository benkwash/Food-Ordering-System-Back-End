var crypto = require('crypto');

module.exports = 
{
    //generate random code...8 characters
    generateCode(maxCharacters=8) 
    {
        return new Promise(function(resolve, reject) {
            crypto.randomBytes(8, (err, buf) => {
                if (err) {
                    reject(err);
                } else {
                    let code = buf.toString('hex').substring(0, maxCharacters);
                    resolve(code.toLocaleUpperCase());
                }
            });
        })
    }
}