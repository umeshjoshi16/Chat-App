import Message from "../Model/Message.js";
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