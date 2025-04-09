class APIErrors extends Error{
    constructor(
        statusCode,
        message = "OOPS!!! Something Went Wrong",
        errors=[],
        stack=""
    ){
        super(message);
        this.statusCode=statusCode
        this.success = false
        this.data = null
        this.errors=errors;
        
        if(stack){
            this.stack=stack;
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export default APIErrors;