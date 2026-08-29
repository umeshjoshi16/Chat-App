import mongoose from "mongoose";
import Message from "../Model/message.js";
import { s3 } from "../Config/s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getIO } from "../socket.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message, messageType = "text" } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message.trim(),
      messageType,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "fullName username profileImageUrl")
      .populate("receiver", "fullName username profileImageUrl");

    // Get Socket.IO instance
    const io = getIO();

    // Send realtime message to receiver
    io.to(`user:${receiverId}`).emit(
      "new_message",
      populatedMessage
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });

  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const messages = await Message.find({
      $or: [
        {
          sender: senderId,
          receiver: userId,
        },
        {
          sender: userId,
          receiver: senderId,
        },
      ],
    })
      .populate(
        "sender",
        "fullName username profileImageUrl"
      )
      .populate(
        "receiver",
        "fullName username profileImageUrl"
      )
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });

  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get messages",
    });
  }
};


export const getChats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const chats = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId },
          ],
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },

      {
        $addFields: {
          otherUser: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender",
            ],
          },
        },
      },

      {
        $group: {
          _id: "$otherUser",

          lastMessage: {
            $first: "$message",
          },

          lastMessageAt: {
            $first: "$createdAt",
          },

          lastMessageType: {
            $first: "$messageType",
          },
        },
      },

      {
        $sort: {
          lastMessageAt: -1,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $unwind: "$user",
      },

      {
        $project: {
          _id: 0,

          user: {
            _id: "$user._id",
            fullName: "$user.fullName",
            username: "$user.username",
            profileKey: "$user.profileKey",
          },

          lastMessage: 1,
          lastMessageAt: 1,
          lastMessageType: 1,
        },
      },
    ]);

    // Generate signed profile image URLs
    const chatsWithImages = await Promise.all(
      chats.map(async (chat) => {
        let profileImageUrl = null;

        if (chat.user.profileKey) {
          const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: chat.user.profileKey,
          });

          profileImageUrl = await getSignedUrl(s3, command, {
            expiresIn: 300,
          });
        }

        return {
          ...chat,
          user: {
            ...chat.user,
            profileImageUrl,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      chats: chatsWithImages,
    });

  } catch (error) {
    console.error("Get chats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get chats",
    });
  }
};