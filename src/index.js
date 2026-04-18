//require('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import connectDB from './db/index.js'

dotenv.config({
  path:'./env'
})


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

