import asyncHandler from "../utils/asyncHandler.js"

const registerDemo = asyncHandler(async (req,res)=>{
    res.status(200).send("registered demo successful");
})

export {
    registerDemo,
}
