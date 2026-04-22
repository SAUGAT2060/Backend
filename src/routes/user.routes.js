import {Router} from 'express'
import { registerUser } from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
const router = Router()

//We injected the middle ware upload from the multer to handle files our avatar and coverImage
router.route("/register").post(
  upload.fields([
    {
      name:"avatar",
      maxCount:1
    },{
      name:"coverImage",
      maxCount:1
    }
  ]),
  registerUser

)




export default router