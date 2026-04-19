//require('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import connectDB from './db/index.js'
import { app } from "./app.js"

dotenv.config({
  path:'./env'
})


<<<<<<< HEAD
connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000, ()=>{
    console.log(`Server is running at port ${process.env.PORT}`);
    
  })
 
})
.catch((err)=>{
  console.log("Mongo DB connection failed!!!", err);
  
})

 app.on("error",(error) =>{
    console.log("ERROR:",error);
    throw error;
    
  })
=======
connectDB().
then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log(`Server is running at ${process.env.PORT}`)
  })
  .on("Error",(error)=>{
    console.log("Error while connecting to the port:",error);
  })

})


.catch((error)=>{
  console.log("Error while connecting to the database!",error);
  

})
>>>>>>> 9c398ed8cc8ff188161b79d4335862a971c47e95
/*

Approach 1 
import express from 'express'

const app = express()
//IIFE = Immediately Invoked Function Expression


( async () => {

  try{
     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
     app.on("error",(error)=>{
      console.log("Error:",error);
      throw error
     })

     app.listen(process.env.PORT,()=>{
      console.log(`App is listening on port${process.env.PORT}`);
    })
  }

  catch(error){
    console.error("Error:",error)
    throw error
  }
} )

()
*/

