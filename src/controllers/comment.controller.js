import mongoose from 'mongoose'
import { Comment } from '../models/comment.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const getVideoComments = asyncHandler(async (req, res) => {

  /**
   * STEP 1: Get videoId from req.params
   * STEP 2: Get page and limit from req.query for pagination
   * STEP 3: Validate videoId → throw 400 if missing
   * STEP 4: Build aggregation pipeline:
   *         - $match    → filter comments by videoId
   *         - $lookup   → go to users collection and attach owner details
   *         - $addFields → unwrap ownerDetails from array to single object using $first
   *         - $project  → send only content, createdAt, ownerDetails(username, avatar, fullName)
   *         - $skip     → skip comments based on page using formula (page-1)*limit
   *         - $limit    → limit how many comments come back per page
   * STEP 5: Send response back to frontend
   */

  // STEP 1 & 2: Extract videoId from URL and pagination values from query
  // videoId tells us which video's comments to fetch
  // page and limit control how many comments come back at once
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query

  // Convert to numbers because req.query gives strings
  // (page-1)*limit would break with strings
  const pageNum = Number(page)
  const limitNum = Number(limit)

  // STEP 3: Validate videoId
  // Without videoId we don't know which video to fetch comments for
  if (!videoId) {
    throw new ApiError(400, "Missing videoId - bad request!!")
  }

  // STEP 4: Aggregation pipeline
  // We use pipeline because data is scattered across collections
  // comments collection has comment text
  // users collection has owner details
  // pipeline joins them together in one database call
  const comment = await Comment.aggregate([

    // STAGE 1: $match
    // Filter down to only comments belonging to this specific video
    // Must convert videoId string to ObjectId because
    // aggregation is raw MongoDB and doesn't auto convert
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId)
      }
    },

    // STAGE 2: $lookup
    // Each comment has owner field which is just a raw ObjectId
    // Go to users collection and bring back full owner details
    // Attach them to each comment as ownerDetails array
    {
      $lookup: {
        from: "users",          // collection to go to
        localField: "owner",    // field in comment that holds user id
        foreignField: "_id",    // match against _id in users collection
        as: "ownerDetails",     // name the result
      }
    },

    // STAGE 3: $addFields
    // $lookup always returns an array even for one result
    // $first unwraps that array into a clean single object
    // ownerDetails: [{ john }] → ownerDetails: { john }
    {
      $addFields: {
        ownerDetails: {
          $first: "$ownerDetails"
        }
      }
    },

    // STAGE 4: $project
    // Control what goes to frontend
    // Only send what is needed, hide everything sensitive
    // password and refreshToken are hidden automatically
    {
      $project: {
        content: 1,       // the actual comment text
        createdAt: 1,     // when comment was posted
        ownerDetails: {   // nested owner info
          username: 1,    // who wrote the comment
          avatar: 1,      // their profile picture
          fullName: 1     // their display name
        }
      }
    },

    // STAGE 5: $skip
    // Jump over comments already seen on previous pages
    // formula: (page - 1) * limit
    // page 1 → skip 0, page 2 → skip 10, page 3 → skip 20
    {
      $skip: (pageNum - 1) * limitNum
    },

    // STAGE 6: $limit
    // After skipping, only return this many comments
    // Prevents sending thousands of comments at once
    {
      $limit: limitNum
    }

  ])

  // STEP 5: Send response back to frontend
  // comment is an array of paginated comments
  // each comment has content, createdAt and owner details
  return res
    .status(200)
    .json(
      new ApiResponse(200, comment, "Comment fetched Successfully!!")
    )
})

//CRUD
//Add Comments 

const addComments = asyncHandler(async (req,res)=>{

  /**
 * STEP 1: Get data from request
 *         - content  → req.body (comment text user typed)
 *         - videoId  → req.params (which video is being commented on)
 *         - owner    → req.user._id (logged in user from verifyJWT)
 */

const {content} = req.body
const {videoId} = req.params
const owner = req.user._id 



/*
 * STEP 2: Validate
 *         - if videoId missing → throw 400
 *         - if content empty  → throw 400
 * 
 */

if(!videoId){
  throw new ApiError(400, "Invalid Video Id!!")
}

if(!content){
throw new ApiError(400,"Content is empty")
}
/*
 *
 * STEP 3: Create comment in DB
 *         - Comment.create({ content, video: videoId, owner: req.user._id })
 */
 
const newComment = await Comment.create({
  content,
  video:videoId,
  owner
})
/*
 * STEP 4: Check if comment was created successfully
 *         - if not → throw 500 (server error)
 */ 

if(!newComment){
  throw new ApiError(500, "Invalid Request, Request Denied!! ")
}
/*
 * STEP 5: Send response back to frontend
 */
return res
.status(200)
.json(
  new ApiResponse(200 , newComment, "Comment added SuccessFully!")
)
})

const updateComments = asyncHandler(async(req,res)=>{
  
  // Get request from request, url and owner
  const {content} = req.body
  const {commentId}= req.params
  const owner = req.user._id

  if(!commentId){
    throw new ApiError(400,"Invalid Request!")
  }

  if(!content){
    throw new ApiError(400,"Content is empty")
  }


//Save to the Database 
const comment = await Comment.findById(commentId)

//Checking if the comment exists or no 
if(!comment){
  throw new ApiError(404,"Comment not found ")
  
}

//Checking if the owner of the comment is same
if(comment.owner.toString()!==owner.toString()){
  throw new ApiError(403, "You can't update someone else's comment")
}

//Updating the old comment with the new comment if they match
const updatedComment = await Comment.findByIdAndUpdate(
  commentId,
  {$set:{content}},
  {new:true}
)

//Returning response 
return res
.status(200)
.json(new ApiResponse(200, updatedComment, "Comment Updated successfully!"))
})

const deleteComments =asyncHandler(async(req,res)=>{

  //Comment Id from the url and owner from database
  const {commentId} = req.params
  const owner = req.user._id

  //Check if the commentId exists
  if(!commentId){
    throw new ApiError(400,"Invalid Request")
  }

  //Finding the comment in the database and checking if it exists or no
  const comment = await Comment.findById(commentId)

  if(!comment){
    throw new ApiError(404, "Comment doesn't exist")
  }
  //Checking the ownership 
  if(comment.owner.toString()!==owner.toString()){
  throw new ApiError(403, "You can't delete someone else's comment")
}


const deleteComment = await Comment.findByIdAndDelete(commentId)

//Sending response
return res.
status(200)
.json(new ApiResponse(200, {}, "Comment deleted Successfully!"))

}) 
export {
  getVideoComments,
  addComments,   
  updateComments,
  deleteComments
}