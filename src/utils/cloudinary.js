import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async(localpath)=>{
    if(!localpath) return null;

    try {

        //upload file on cloudinary
        const response = await cloudinary.uploader.upload({
            localpath,
            resource_type:"auto",
        })
        await fs.unlinkSync(localpath);
        return response;

    } catch (error) {
        
        console.error("Cloudinary Upload Error:",error.message)

        //attemp to delete the localfile even on failure    
        try {
            await fs.unlinkSync(localpath);
        } catch (unlinkErr) {
            console.error("Failed to delete localfile:",unlinkErr.message);
        }

        //return more detailed error or null
        return {
            success:false,
            message:"Upload Error",
            error:error.message
        }
    }
}

export {uploadOnCloudinary}