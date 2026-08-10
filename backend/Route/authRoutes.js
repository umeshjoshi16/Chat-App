import express from "express";
import { registerUser, loginUser, logoutUser,} from "../Controller/authController.js";
import { isAuthenticated } from "../Middleware/authMiddleware.js";
import { checkUsername, getMe, searchUsers, updateProfile } from "../Controller/userController.js";
import { getProfileUploadUrl } from "../Controller/generatePresignedUrl.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get('/me',isAuthenticated,getMe);
router.get('/check-username',checkUsername);
router.get('/users/search',searchUsers);




router.post("/profile/upload-url",isAuthenticated,getProfileUploadUrl);
router.put("/profile-update",isAuthenticated,updateProfile);

export default router;