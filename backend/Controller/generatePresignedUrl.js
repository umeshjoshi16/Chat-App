import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import path from "path";
import { s3 } from "../Config/s3.js";

export const getProfileUploadUrl = async (req, res, next) => {
  try {
    const { fileName, fileType } = req.body;
    const userId = req.user.id;

    if (!fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: "File name and file type are required.",
      });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image type.",
      });
    }

    const extension = path.extname(fileName);

    const key = `users/${userId}/profile/${uuid()}-${Date.now()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
    });

    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.status(200).json({
      success: true,
      uploadUrl,
      key,
    });
  } catch (error) {
    next(error);
  }
};