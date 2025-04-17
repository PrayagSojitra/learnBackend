import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credential:true,
}))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

//Routes import
import userRouteDemo from "./routes/Demo.route.js"
import userRoute from "./routes/user.route.js"

//Routes Declaration
app.use("/api/v1/userDemo",userRouteDemo);
app.use("/api/v1/user",userRoute);

export default app;