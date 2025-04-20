import express  from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";

dotenv.config()


const app=express();

// app.use in Express.js is used to define middleware functions that are executed for every request to the app, or for specific routes.

app.use(express.json())
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.send("Hey guys! Welcome to Codentia!!")
    
})

app.use("/api/v1/auth",authRoutes)



app.listen(process.env.PORT,()=>{
    console.log("Server is running on port 8080")
})