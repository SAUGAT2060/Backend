import express from 'express'
<<<<<<< HEAD
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

=======

const app = express()

>>>>>>> 9c398ed8cc8ff188161b79d4335862a971c47e95
export {app}