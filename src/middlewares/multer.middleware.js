import multer from "multer";





const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
   
    cb(null, file.originalname) // Might get a problem while override but since we will only have the file for a small period of time thats fine
  }
})

export const upload = multer({ 
  storage ,//ES6 storage:storage written as just one
})