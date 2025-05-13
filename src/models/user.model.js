import mongoose, { mongo, Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },
        avatar:{
            type:String,
            required:true,
        },
        coverimage:{
            type:String,
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        watchhistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        refreshToken:{
            type:String,
        }
    },
    {
        timestamps:true,
    }
)

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.genrateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,
    },process.env.ACCESS_TOKEN_SECRET_KEY,{ expiresIn:process.env.ACCESS_TOKEN_EXPIRY_KEY } )
};

userSchema.methods.genrateRefreshToken=function(){
    return jwt.sign({
        _id:this._id,
    },process.env.REFRESH_TOKEN_SECRET_KEY,{ expiresIn:process.env.REFRESH_TOKEN_EXPIRY_KEY } )
};

export const User = mongoose.model("User",userSchema);