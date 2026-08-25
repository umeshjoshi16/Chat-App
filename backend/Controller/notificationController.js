import { Notification } from "../Model/notification.js";
import { s3 } from "../Config/s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({
      recipient: userId,
    })
      .populate("sender", "fullName username profileKey")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formattedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        let profileImageUrl = null;

        if (notification.sender?.profileKey) {
          const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: notification.sender.profileKey,
          });

          profileImageUrl = await getSignedUrl(s3, command, {
            expiresIn: 300,
          });
        }

        return {
          ...notification,
          sender: {
            ...notification.sender,
            profileImageUrl,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      notifications: formattedNotifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationSeen = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.notificationId;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId,
      },
      {
        seen: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};