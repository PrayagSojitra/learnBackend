import cookieParser from "cookie-parser";
import express from "express";

const app = express();

app.use(cosr({
    origin:process.env.CORS_ORIGIN,
    credential:true,
}))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

export default app;