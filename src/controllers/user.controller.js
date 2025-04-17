import asyncHandler from "../utils/asyncHandler.js";
import APIErrors from "../utils/APIErrors.js";
import APIResponse from "../utils/APIResponse.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
    ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from "http-status-codes"

const registerUser = asyncHandler( async(req,res)=>{
    //steps to understand the logic of registerUser
    //get user deatails from frontEnd
    //validation - not empty deatails
    //check if user is allready 
    //check for images and check for avatar
    //the upload them to cloudinary
    //craete User object and create entry in db
    //remove password and refreshToken field from response
    //check for user creation 
    //return final response

    //step-1
    const {fullname,username,password,email} = req.body;

    //step-2
    if(
        [fullname,username,password,email].some((field)=>
            field?.trim() === ""
        )
    ){
        throw new APIErrors(StatusCodes.NOT_ACCEPTABLE,"All fields are required");
    }

    //step-3
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new APIErrors(StatusCodes.CONFLICT,"User with this email or username already existed");
    }

    //console.log(req.files);

    //step-4
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new APIErrors(StatusCodes.BAD_REQUEST,"Avatar file required");
    }

    //step-5
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    //const coveerImage = await uploadOnCloudinary(coverImageLocalPath);

    //step-6
    const user = User.create({
        fullname,
        email,
        password,
        username:username.toLowerCase(),
        avatar:avatar.url,
        coverimage:coverimage.url || "",
    })
    
    //step-7
    const userCreated = User.findById(user._id).select(
        "-password -refreshToken"
    )

    //step-8
    if (!userCreated) {
        throw new APIErrors(StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong while registering the user");
    }

    //step-9
    return res.status(StatusCodes.CREATED).json(
        new APIResponse(StatusCodes.OK,userCreated,"User Registed Successfully")
    )
})

export{
    registerUser
}

