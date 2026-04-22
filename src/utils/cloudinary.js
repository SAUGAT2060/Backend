import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs' //File System for CRUD operation and many more

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{

  try{

    if(!localFilePath) return null
    //Upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath,{
      resource_type:"auto"

    })
    //File has been uploaded successfully
    console.log("File uploaded on cloudinary", response.url);
    return response;
    
  } catch (error){
    fs.unlinkSync(localFilePath) //Removes the locally saved temporary file as the upload operation fails

    return null

  }
}

export {uploadOnCloudinary}