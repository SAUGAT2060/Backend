import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()

app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true, 
}))
//Accepting json 
app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true , limit:"16 kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// Import routes
 import userRouter from './routes/user.routes.js'


// routes declaration
app.use("/api/v1/users", userRouter)


//https://localhost:8000//api/v1/users/register




export {app}