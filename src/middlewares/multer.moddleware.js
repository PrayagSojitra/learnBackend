import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public/temp")
    },
    filename:function (req,file,cb) {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname,ext);
        cb(null,`${name}-${Date.now()}${ext}`);
    }
})

export const upload = multer({
    storage:storage,
})