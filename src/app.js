import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";



// CORS CONFIGURATION
const app = express()


//BASIC CONFIGURTION
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("Public"));
app.use(cookieParser());


app.use(
  cors({
    origin:process.env.CORS_ORIGIN?.split(",")|| "http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders:["Content-type","Authorization"]
}))

//NOW IMPORT THE ROUTES

import healthcheckrouter from "./Routes/healthcheck.route.js"
import authRouter from "./Routes/auth.routes.js"

app.use("/api/v1/healthcheck",healthcheckrouter)
//as now it treated as a home route if i need some /api/v1/healthcheck/{after this }
// then i just have to chnage the route add one more in that
// app.use("/api/v1/healthcheck/instagram",healthcheckrouter)


app.use("/api/v1/auth",authRouter);


app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/instagram', (req, res) => {
  res.send('Hello World!, this is an Instagram Page ')
})







export default app ;
