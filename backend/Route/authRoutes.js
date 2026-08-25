import express from "express";
import { registerUser, loginUser, logoutUser,} from "../Controller/authController.js";
import { isAuthenticated } from "../Middleware/authMiddleware.js";
import { checkUsername, getMe, searchUsers, updateProfile } from "../Controller/userController.js";
import { getProfileImageUrl, getProfileUploadUrl } from "../Controller/generatePresignedUrl.js";
import { sendFriendRequest,acceptFriendRequest,cancelFriendRequest,rejectFriendRequest,removeFriend,checkFriendship,} from "../Controller/friendshipController.js";
import { getNotifications,markNotificationSeen} from "../Controller/notificationController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get('/me',isAuthenticated,getMe);
router.get('/check-username',checkUsername);
router.get('/users/search',searchUsers);


router.post("/profile/upload-url",isAuthenticated,getProfileUploadUrl);
router.get("/profile/image",isAuthenticated,getProfileImageUrl);
router.put("/profile-update",isAuthenticated,updateProfile);

//friendship
router.post("/send-request/:userId", isAuthenticated, sendFriendRequest);
router.put("/accept-request/:friendshipId", isAuthenticated, acceptFriendRequest);
router.delete("/cancel-request/:friendshipId", isAuthenticated, cancelFriendRequest);
router.delete("/reject-request/:friendshipId", isAuthenticated, rejectFriendRequest);
router.delete("/remove-friend/:friendshipId", isAuthenticated, removeFriend);
router.get("/status/:userId", isAuthenticated, checkFriendship);


//notification
router.get("/notifications", isAuthenticated, getNotifications);
router.put( "/notifications/:notificationId/seen", isAuthenticated, markNotificationSeen);

export default router;