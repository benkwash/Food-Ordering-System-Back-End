//construct response json
class FrontEndResponse 
{
    constructor(){
        //nothing
    }

    //get new response
    getNewFrontEndResponse()
    {
        //construct and return a response object
        return this.constructNewResponse();
    }

    //construct a response object
    //response will be sent back to the front-end
    //08-01-2018
    constructNewResponse()
    {
        let custResponse = {
            response:null,
            status:200,
            msg:"",
            form:null ,
            data:{
                token:null,
                path:null,
                fetched:null,
                other:null
            }
        };

        return custResponse;
    }
}

// let response = {
//     response:null,
//     status:null,
//     msg:null,
//     form:null ,
//     data:{
//         token:null,
//         path:null,
//         fetched:null,
//         other:null
//     }
// };

// {response:null,status:null,msg:null,form:null ,data:{token:null,path:null,fetched:null,other:null}}
// module.exports = response;
module.exports = FrontEndResponse;
