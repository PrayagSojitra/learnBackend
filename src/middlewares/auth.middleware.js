import jwt from "jsonwebtoken"
import {asyncHandler} from "../utils/asyncHandler.js"
import {APIErrors} from "../utils/APIErrors.js"
import {User} from "../models/user.model.js"

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer "," ");

        if(!token){
            throw new APIErrors(401,"Unauthorized request");
        }

        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY);
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new APIErrors(401, "Invalid Access Token")
        }
        req.user = user;
        next()
        
    } catch (error) {
        throw new APIErrors(401,error?.message || "Invalid Token!");
    }
})