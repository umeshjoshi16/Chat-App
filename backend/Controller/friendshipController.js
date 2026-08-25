import { Friend, User } from '../Model/user.js';
import { Notification } from '../Model/notification.js';
import { getIO } from '../socket.js';
import { getSignedProfileImageUrl } from "./generatePresignedUrl.js";

export const checkFriendship = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    if (currentUserId === targetUserId) {
      return res.status(200).json({
        success: true,
        status: "self",
      });
    }

    const friendship = await Friend.findOne({
      $or: [
        {
          requester: currentUserId,
          recipient: targetUserId,
        },
        {
          requester: targetUserId,
          recipient: currentUserId,
        },
      ],
    });

    if (!friendship) {
      return res.status(200).json({
        success: true,
        status: "none",
      });
    }

    if (
      friendship.requester.toString() === currentUserId &&
      friendship.status === "pending"
    ) {
      return res.status(200).json({
        success: true,
        status: "pending_sent",
        friendshipId: friendship._id,
      });
    }

    if (
      friendship.recipient.toString() === currentUserId &&
      friendship.status === "pending"
    ) {
      return res.status(200).json({
        success: true,
        status: "pending_received",
        friendshipId: friendship._id,
      });
    }

    if (friendship.status === "accepted") {
      return res.status(200).json({
        success: true,
        status: "friends",
        friendshipId: friendship._id,
      });
    }

    if (friendship.status === "rejected") {
      return res.status(200).json({
        success: true,
        status: "rejected",
        friendshipId: friendship._id,
      });
    }

    if (friendship.status === "blocked") {
      return res.status(200).json({
        success: true,
        status: "blocked",
        friendshipId: friendship._id,
      });
    }

    return res.status(200).json({
      success: true,
      status: friendship.status,
      friendshipId: friendship._id,
    });
  } catch (error) {
    next(error);
  }
};
export const cancelFriendRequest = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const friendshipId = req.params.friendshipId;

    const friendship = await Friend.findById(friendshipId);

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found.",
      });
    }

    if (friendship.requester.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "You cannot cancel this request.",
      });
    }

    if (friendship.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request is no longer pending.",
      });
    }

    await Friend.findByIdAndDelete(friendshipId);

    return res.status(200).json({
      success: true,
      message: "Friend request cancelled successfully.",
    });
  } catch (error) {
    next(error);
  }
};
export const sendFriendRequest = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself as a friend.",
      });
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const currentUser = await User.findById(currentUserId).select(
      "fullName username profileImageUrl"
    );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found.",
      });
    }

    const existingFriendship = await Friend.findOne({
      $or: [
        {
          requester: currentUserId,
          recipient: targetUserId,
        },
        {
          requester: targetUserId,
          recipient: currentUserId,
        },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === "accepted") {
        return res.status(400).json({
          success: false,
          message: "You are already friends.",
        });
      }

      if (existingFriendship.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "Friend request already exists.",
        });
      }

      if (existingFriendship.status === "blocked") {
        return res.status(403).json({
          success: false,
          message: "You cannot send a friend request to this user.",
        });
      }

      if (existingFriendship.status === "rejected") {
        existingFriendship.requester = currentUserId;
        existingFriendship.recipient = targetUserId;
        existingFriendship.status = "pending";
        existingFriendship.actionBy = null;

        await existingFriendship.save();

        const notification = await Notification.create({
          recipient: targetUserId,
          sender: currentUserId,
          type: "friend_request",
          message: "You received a new friend request.",
          data: {
            friendshipId: existingFriendship._id,
          },
        });

        const populatedNotification = await Notification.findById(
          notification._id
        ).populate(
          "sender",
          "fullName username profileImageUrl"
        );

        const io = getIO();

        io.to(`user:${targetUserId}`).emit(
          "friend_request",
          populatedNotification
        );

        return res.status(200).json({
          success: true,
          message: "Friend request sent.",
          friendship: existingFriendship,
        });
      }
    }

    const friendship = await Friend.create({
      requester: currentUserId,
      recipient: targetUserId,
      status: "pending",
    });

    const notification = await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: "friend_request",
      message: "You received a new friend request.",
      data: {
        friendshipId: friendship._id,
      },
    });

    const populatedNotification = await Notification.findById(
      notification._id
    ).populate(
      "sender",
      "fullName username profileImageUrl"
    );

    const io = getIO();

    io.to(`user:${targetUserId}`).emit(
      "friend_request",
      populatedNotification
    );

    return res.status(201).json({
      success: true,
      message: "Friend request sent.",
      friendship,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptFriendRequest = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const friendshipId = req.params.friendshipId;

    const friendship = await Friend.findById(friendshipId);

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found.",
      });
    }

    if (friendship.recipient.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "You cannot accept this request.",
      });
    }

    if (friendship.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request is no longer pending.",
      });
    }

    friendship.status = "accepted";
    friendship.actionBy = currentUserId;

    await friendship.save();

    return res.status(200).json({
      success: true,
      message: "Friend request accepted.",
      friendship,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectFriendRequest = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const friendshipId = req.params.friendshipId;

    const friendship = await Friend.findById(friendshipId);

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found.",
      });
    }

    if (friendship.recipient.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "You cannot reject this request.",
      });
    }

    if (friendship.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request is no longer pending.",
      });
    }

    friendship.status = "rejected";
    friendship.actionBy = currentUserId;

    await friendship.save();

    return res.status(200).json({
      success: true,
      message: "Friend request rejected.",
    });
  } catch (error) {
    next(error);
  }
};

// export const cancelFriendRequest = async (req, res, next) => {
//   try {
//     const currentUserId = req.user.id;
//     const friendshipId = req.params.friendshipId;

//     const friendship = await Friend.findById(friendshipId);

//     if (!friendship) {
//       return res.status(404).json({
//         success: false,
//         message: "Friend request not found.",
//       });
//     }

//     if (friendship.requester.toString() !== currentUserId) {
//       return res.status(403).json({
//         success: false,
//         message: "You cannot cancel this request.",
//       });
//     }

//     if (friendship.status !== "pending") {
//       return res.status(400).json({
//         success: false,
//         message: "This request is no longer pending.",
//       });
//     }

//     await Friend.findByIdAndDelete(friendshipId);

//    return res.status(200).json({
//   success: true,
//   status,
//   friendshipId: friendship?._id || null,
// });
//   } catch (error) {
//     next(error);
//   }
// };

export const removeFriend = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    const friendship = await Friend.findOne({
      $or: [
        {
          requester: currentUserId,
          recipient: targetUserId,
        },
        {
          requester: targetUserId,
          recipient: currentUserId,
        },
      ],
      status: "accepted",
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friendship not found.",
      });
    }

    await Friend.findByIdAndDelete(friendship._id);

    return res.status(200).json({
      success: true,
      message: "Friend removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getFriends = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const friendships = await Friend.find({
      $or: [
        { requester: userId, status: "accepted" },
        { recipient: userId, status: "accepted" },
      ],
    })
      .populate("requester", "fullName username profileKey")
      .populate("recipient", "fullName username profileKey");

    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const friend =
          friendship.requester._id.toString() === userId
            ? friendship.recipient
            : friendship.requester;

        let profileImageUrl = null;

        if (friend.profileKey) {
          profileImageUrl = await getSignedProfileImageUrl(
            friend.profileKey
          );
        }

        return {
          _id: friend._id,
          fullName: friend.fullName,
          username: friend.username,
          profileImageUrl,
        };
      })
    );

    return res.status(200).json({
      success: true,
      friends,
    });
  } catch (error) {
    next(error);
  }
};