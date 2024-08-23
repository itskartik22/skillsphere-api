const { uploadImageToBlob } = require("./blobStorageHandler");

const uploadPhoto = async (courseId, containerName, file, buffer) => {
  try {
    const blobName = `pp-${courseId}.${file.mimetype.split("/")[1]}`;
    const imgUrl = await uploadImageToBlob(containerName, blobName, buffer);
    return {
        imgUrl,
        status: "success",
    }
  } catch (error) {
    return {
        status: "fail",
        message: "Error uploading image"
    }
  }
};

exports.uploadPhoto = uploadPhoto;