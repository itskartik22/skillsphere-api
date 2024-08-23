const { BlobServiceClient } = require("@azure/storage-blob");
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

const uploadImageToBlob = async (containerName, blobName, buffer) => {
  try {
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
    await blockBlobClient.upload(buffer, buffer.length);
    return blockBlobClient.url;
  } catch (error) {
    console.log(error);
  }
};

const uploadVideoToBlob = async (containerName, blobName, stream, fileSize) => {
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadStream(stream, fileSize);
  return blockBlobClient.url;
};

module.exports = { uploadImageToBlob, uploadVideoToBlob };
