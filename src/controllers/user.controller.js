import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler( async (req,res)=>{
// ---LOGIC BUILDING FOR REGISTRATION OF THE USER--

  //Get user details from frontend --Done


  //Validation of the details sent by the user - not empty, -- Done
  //check if user already exists: username ,email --Done
  //check files images,(Avatar) -- Done
  //Upload the images to Cloudinary ,and check it on cloudinary --Done
  //Create user object - create entry in database --Done
  //remove password and refresh token field from response --Done
  //check for user creation --Done
  //return response --Done

  
  const {fullName,email,username,password } = req.body
  // console.log("Username:",username);

  //IF ELSE SAMPLE 
  
  // if(fullName === ""){
  //   throw new ApiError(400,"Full Name is required!!")
  // }
  //We can use if else again but thats basic we will do something advance here so that it'snot hectic to rewrite if else again and again 

  if(
    [fullName,email,username,password].some((filed)=>filed?.trim()==="")
  ){
    throw new ApiError(400, "All fields are required!!")
  }
//Here we are using some method to check if we have existence value of every data taken from the user
  

//findOne method to check if we have a user with the identical email,username,password
const existedUser = await User.findOne({
  $or:[{username} , {email}] // we are using operator here to check multiple fields in the db for instance here we are checking username and email
})

if(existedUser){
  throw new ApiError(409,"User with this email or username already exists!!")
}

//We get req.files access because of multer while we get req.body from express by default
// console.log("REQ FILES:", req.files)  // add this
const avatarLocalPath = req.files?.avatar[0]?.path;
//  const coverImageLocalPath = req.files?.coverImage[0]?.path;

 let coverImageLocalPath ;

 if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){

  coverImageLocalPath = req.files.coverImage[0].path
 }

 //Will throw error on failure 
  if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is required")
  }
  //Upload to cloudinary 
  const avatar=  await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400,"Avatar file is required")
  }

//Lets talk to db now 

const user = await User.create({
  fullName,
  avatar: avatar.url,
  coverImage:coverImage?.url || "", //if there's url then url or else empty ""
  email,
  password,
  username: username.toLowerCase()
})
//Check if the user is created by using find byId
const createdUser = await User.findById (user._id).select(
  "-password -refreshToken" //Here we are using .select method to take response that we don't need and here we don't need password and refreshToken
)

if(!createdUser){
  throw new ApiError(500,"Something went wrong while registering the user")
}

//Sending response using API Response

return res.status(201).json(
  new ApiResponse(200, createdUser , "User registered Successfully")
)
})

export {registerUser}