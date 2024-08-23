const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig");
const { v4: uuid4 } = require("uuid");


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "course-videos",
    resource_type: "video",
    public_id: (req, file) => {
      const {courseId} = req.body;
      console.log(courseId);
      console.log(file);
      return `${uuid4()}-${file.originalname.split(".")[0]}`;
    },
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
