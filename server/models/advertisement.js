import { s3 } from "./s3.js";
import { ListObjectsV2Command, GetObjectCommand, HeadBucketCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Retrieve all finalized advertisements
const getAllFinalizedAd = async (companyName, userId) => {
  try {
    const bucketName = `${companyName.toLowerCase().replace(/[^a-z0-9-]/g, "-")}-${userId.toLowerCase()}`;
    console.log("Constructed Bucket Name:", bucketName);

    const prefix = "finalized-advertisement/";
    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      })
    );

    if (data.Contents) {
      const files = await Promise.all(
        data.Contents.map(async (item) => {
          const signedUrl = await getSignedUrl(
            s3,
            new GetObjectCommand({
              Bucket: bucketName,
              Key: item.Key,
              ResponseContentDisposition: 'inline',
            }),
            { expiresIn: 3600 }
          );
          return {
            fileName: item.Key.replace(prefix, ""),
            url: signedUrl,
          };
        })
      );
      console.log("Fetched Files:", files);
      return files;
    } else {
      console.log("No files found in bucket.");
      return [];
    }
  } catch (error) {
    console.error("Model Error:", error);
    throw new Error(`Failed to retrieve finalized advertisements: ${error.message}`);
  }
};


// Retrieve finalized adveritsement  
const getFinalizedAd = async (user, fileName) => {
  try {
    const bucketName = `${user.Company.toLowerCase().replace(/[^a-z0-9-]/g, "-")}-${user.UserId.toLowerCase()}`;
    const key = `finalized-advertisement/${fileName}`;

    // Retrieve the object from S3
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
      ResponseContentDisposition: 'inline',
    });

    const data = await s3.send(command);
    const stream = data.Body; // File content as a readable stream

    return {
      message: `Advertisement retrieved successfully: ${fileName}`,
      fileStream: stream,
    };
  } catch (error) {
    console.error("Error retrieving finalized advertisement:", error.message);
    throw new Error(`Error retrieving advertisement: ${error.message}`);
  }
};

// Upload finalized advertisement 
async function uploadFinalizedAd(req, fileName, fileContent) {
  try {
    // Retrieve user data from req.user or req.session.user
    const user = req.user || req.session?.user || "";
    if (!user || !user.Company || !user.UserId) {
      throw new Error("Invalid user object: Missing Company or UserId");
    }
    if (!fileName) {
      throw new Error("FileName is required");
    }
    if (!fileContent) {
      throw new Error("FileContent is required");
    }

    // Construct the bucket name (e.g., "amazon-u00017")
    const bucketName = `${user.Company.toLowerCase().replace(/[^a-z0-9-]/g, "-")}-${user.UserId.toLowerCase()}`;

    // Verify if the bucket exists.
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket ${bucketName} exists`);
    } catch (error) {
      console.error(`Bucket ${bucketName} not found: ${error.message}`);
      throw new Error(`Bucket ${bucketName} does not exist`);
    }

    // Define the key (file path) for the finalized advertisement folder.
    const key = `finalized-advertisement/${fileName}`;

    // Dynamically determine the correct ContentType based on the file extension.
    let contentType = "application/octet-stream";
    const lowerFileName = fileName.toLowerCase();
    if (lowerFileName.endsWith(".mp4")) {
      contentType = "video/mp4";
    } else if (lowerFileName.endsWith(".mov")) {
      contentType = "video/quicktime";
    } else if (lowerFileName.endsWith(".avi")) {
      contentType = "video/x-msvideo";
    } else if (lowerFileName.endsWith(".mkv")) {
      contentType = "video/x-matroska";
    } else if (lowerFileName.endsWith(".webm")) {
      contentType = "video/webm";
    } else if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    } else if (lowerFileName.endsWith(".png")) {
      contentType = "image/png";
    }

    // Upload the file with the correct metadata.
    const data = await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: contentType,           // Set proper MIME type
        ContentDisposition: "inline",       // Force inline display for preview
      })
    );

    console.log("File uploaded successfully", data);
    return {
      message: `File uploaded to ${bucketName}/finalized-advertisement/${fileName}`,
      data,
    };
  } catch (error) {
    console.error("Error uploading file:", error.message);
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

export { getAllFinalizedAd, getFinalizedAd, uploadFinalizedAd};
