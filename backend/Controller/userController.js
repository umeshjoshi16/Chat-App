import { User } from '../Model/user.js';

import { getSignedProfileImageUrl } from './generatePresignedUrl.js';
import { s3 } from "../Config/s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profileImageUrl = null;

    if (user.profileKey) {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: user.profileKey,
      });

      profileImageUrl = await getSignedUrl(s3, command, {
        expiresIn: 300,
      });
    }

    const userData = user.toObject();

    delete userData.password;

    return res.status(200).json({
      success: true,
      user: {
        ...userData,
        profileImageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const checkUsername = async (req, res, next) => {
  try {
    const { username } = req.query;

    if (!username || username.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const existingUser = await User.exists({
  username: username.trim().toLowerCase(),
});

    if (existingUser) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Username is already taken",
      });
    }

    return res.status(200).json({
      success: true,
      available: true,
      message: "Username is available",
    });
  } catch (error) {
    next(error);
  }
};


export const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.query?.trim();

    if (!query) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const users = await User.find({
      $or: [
        {
          username: {
            $regex: query,
            $options: "i",
          },
        },
        {
          fullName: {
            $regex: query,
            $options: "i",
          },
        },
      ],
    })
      .select("_id fullName username profileKey")
      .limit(20);

    const usersWithImages = await Promise.all(
      users.map(async (user) => ({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        profileImageUrl: await getSignedProfileImageUrl(user.profileKey),
      }))
    );

    res.status(200).json({
      success: true,
      users: usersWithImages,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName,bio,gender, profileKey,} = req.body;

 
    const updateData = {};

    if (fullName !== undefined) {
      updateData.fullName = fullName.trim();
    }

    if (bio !== undefined) {
      updateData.bio = bio.trim();
    }

    if (gender !== undefined) {
      updateData.gender = gender;
    }

    if (profileKey !== undefined) {
      updateData.profileKey = profileKey;
    }

   
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

   
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: updateData,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

  
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};