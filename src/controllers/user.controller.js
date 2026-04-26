import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'

//A method to generate access and refresh token and return them
const generateAccessAndRefreshTokens = async(userId)=>{
    try {
    const user =  await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()


    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false })

      return {accessToken,refreshToken}


    } catch (error) {
      throw new ApiError(500,"Something went wrong while generating refresh and action token")
    }
}

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


const loginUser = asyncHandler (async (req,res)=>{
  //MY thinking
  //Take data from the user and store it in a variable
  //Validate the data according to our Schema
  //Check by calling db if the username/email exists if not throw err
  //if the username is present then get the _id and store it 
  //if the stored username and pass is identical to the provided one 
  //provide the access token and give the person access 
  //Give them a success message at the end


  //Req body --> data
  //username based access/ email 
  //find the user
  //password check
  //access and refresh token generate and send to user
  //send cookies(secure cookies)
  //response

  //Req-body data :
  const {email,username,password} = req.body

  //Username based access/ email
  if(!username && !email){
    throw new ApiError(400,"username or email is required!!")
  }
  console.log("Looking for:", { username, email }) 
  //Find the user
  const user = await User.findOne({
      $or:[{username},{email}]

  })

  if(!user){
    throw new ApiError(404,"User doesn't exist!!")
  }

  //Check the password
 const isPasswordValid = await user.isPasswordCorrect(password)

 if(!isPasswordValid){
  throw new ApiError(401, "Invalid User Credentials")
 }


 //Create access and refresh token

const {accessToken,refreshToken} =  await generateAccessAndRefreshTokens(user._id)

const loggedInUser =  await User.findById(user._id).
select("-password -refreshToken")



const options = {
  httpOnly: true,
  secure:true,

}

return res
.status(200)
.cookie("accessToken",accessToken, options)
.cookie("refreshToken",refreshToken,options)
.json(
  new ApiResponse(
    200,
    {
      user:loggedInUser,
      accessToken,
      refreshToken
    },
    "User Logged In SuccessFully"
  )
)

})

const logoutUser = asyncHandler(async(req,res)=>{
     await  User.findByIdAndUpdate(
        req.user._id,
        {
          $set:{
            refreshToken: undefined
          }
        }
        ,
        {
          new:true
        }
      )

      const options = {
  httpOnly: true,
  secure:true,



}

return res
.status(200)
.clearCookie("accessToken" , options)
.clearCookie("refreshToken" , options)
.json(new ApiResponse(200 , {} ,"User Logged Out"))
})

const refreshAccessToken = (async(req,res)=>{
 try {
  const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken;
 
  if(!incomingRefreshToken){
   throw new ApiError(401,"Unauthorized request!!")
  }
  
  
 const decodedToken = jwt.verify(
   incomingRefreshToken,
  process.env.REFRESH_TOKEN_SECRET
  )
 
 
 //Taking user's information from mongo db
 
 const user = await User.findById(decodedToken?._id)
 
 if(!user){
   throw new ApiError(401,"Invalid refresh token")
 }
 
 if(incomingRefreshToken !== user?.refreshToken){
   throw new ApiError(401, "Refresh Token is expired or used")
 
 }
 
 const options = {
   httpOnly:true,
   secure:true
 }
 //Generate new Token
 const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
 
 return res
 .status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",newRefreshToken,options)
 .json(
   new ApiResponse(
     200,
     {accessToken,newRefreshToken},
     "Access Token Refreshed "
   )
 )
 
 } catch (error) {

    throw new ApiError(401, error?.message || "Invalid refresh token")
 }
})


const changeCurrentPassword = asyncHandler(async(req,res)=>{
//Take old password and newPassword from the received request to change with a new one 
  const {oldPassword, newPassword} = req.body

 

  const user = await  User.findById(res.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid Old Password!!")
  }
// Assign new password to the user object
// This will later be hashed (because we have pre-save middleware in schema)
  user.password = newPassword

// Save updated user to database
// validateBeforeSave is false to skip schema validation on update
  await user.save({validateBeforeSave:false})
 
  // Send success response back to client 
  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed successfully!!"))

})

//End point 
const getCurrentUser = asyncHandler(async(req,res)=>{
   return res
   .status(200)
   .json(200,req.user,"current user fetched successfully!")

})


const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullName,email} = req.body

  if(!fullName || !email){
    throw new ApiError(400,"All fields are required")
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName:fullName,
        email:email,

      }
    },
    {new:true}
  
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"Account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is missing")
  }

 const avatar = await uploadOnCloudinary(avatarLocalPath)

 if(!avatar.url){
  throw new ApiError(400,"Api Error while uploading  avatar")
 }

 const user = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
        avatar:avatar.url
    }
  }
  ,
  {
    new:true
  }
 ).select("-password")

  return res
 .status(200)
 .json(
  new ApiResponse(200,user,"Avatar Image updated Successfully")
 )
   
   
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.file?.path

  if(!coverImageLocalPath){
    throw new ApiError(400,"Cover image file is missing")
  }

 const coverImage = await uploadOnCloudinary(coverImageLocalPath)

 if(!coverImage.url){
  throw new ApiError(400,"Api Error while uploading  cover Image")
 }

 const user = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
        coverImage:coverImage.url
    }
  }
  ,
  {
    new:true
  }
 ).select("-password")

 return res
 .status(200)
 .json(
  new ApiResponse(200,user,"Cover Image updated Successfully")
 )
   
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage
}


