import {Router} from 'express'
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
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

router.route("/login").post(
  loginUser
)

//Secured Routes
router.route("/logout").post(
  verifyJWT,
  logoutUser
)

export default router