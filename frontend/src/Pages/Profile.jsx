import React, { useState, useEffect } from "react";
import { User, Mail,LogOut, AtSign, Calendar, Camera, Save, ArrowLeft, FileText, Users, X } from "lucide-react";
import { useUser } from "../Context/userContext";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  const activeUser = user || {};

  const [formData, setFormData] = useState({
    fullName: activeUser?.fullName || "",
    username: activeUser?.username || "",
    email: activeUser?.email || "",
    avatar: activeUser?.profileImageUrl || activeUser?.avatar || "",
    bio: activeUser?.bio || "",
    gender: activeUser?.gender || "",
    profileKey: activeUser?.profileKey || "",
  });
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  

  useEffect(() => {
  const fetchFriends = async () => {
    try {
      setFriendsLoading(true);

      const { data } = await axios.get(
        "http://localhost:3000/api/auth/friends",
        {
          withCredentials: true,
        }
      );

      setFriends(data.friends || []);
    } catch (error) {
      console.error("Failed to fetch friends:", error);
      toast.error("Failed to load friends");
    } finally {
      setFriendsLoading(false);
    }
  };

  if (user?._id) {
    fetchFriends();
  }
}, [user]);

  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      fullName: user.fullName || "",
      username: user.username || "",
      email: user.email || "",
      avatar: user.profileImageUrl || user.avatar || "",
      bio: user.bio || "",
      gender: user.gender || "",
      profileKey: user.profileKey || "",
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setFormData((prev) => ({
      ...prev,
      avatar: URL.createObjectURL(file),
    }));
  };

  const uploadProfileImage = async () => {
    if (!selectedImage) return formData.profileKey;

    const { data } = await axios.post(
      "http://localhost:3000/api/auth/profile/upload-url",
      {
        fileName: selectedImage.name,
        fileType: selectedImage.type,
      },
      { withCredentials: true }
    );

    const response = await fetch(data.uploadUrl, {
      method: "PUT",
      body: selectedImage,
      headers: { "Content-Type": selectedImage.type },
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    return data.key;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      let key = formData.profileKey;
      if (selectedImage) {
        key = await uploadProfileImage();
      }

     const response = await axios.put(
  "http://localhost:3000/api/auth/profile-update",
  {
    fullName: formData.fullName,
    bio: formData.bio,
    gender: formData.gender,
    profileKey: key,
  },
  {
    withCredentials: true,
  }
);

const data = response.data;


toast.success("Profile updated successfully.");

   
      const updatedUserObject = {
        ...user,
        ...data.user,
        profileImageUrl: data.user.profileImageUrl || data.profileImageUrl || formData.avatar,
      };

      setUser(updatedUserObject);

      setFormData((prev) => ({
        ...prev,
        fullName: updatedUserObject.fullName || "",
        bio: updatedUserObject.bio || "",
        gender: updatedUserObject.gender || "",
        profileKey: updatedUserObject.profileKey || "",
        avatar: updatedUserObject.profileImageUrl || prev.avatar,
      }));

      setSelectedImage(null);
      setIsEditing(false);
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
  try {
    await axios.post(
      "http://localhost:3000/api/auth/logout",
      {},
      {
        withCredentials: true,
      }
    );

    setIsLoggingOut(false);
    setUser(null);
    navigate("/login");

    toast.success("Logged out successfully.");
  } catch (error) {
    console.error(error);
    toast.error(
      error.response?.data?.message || "Failed to logout."
    );
  }
};

  const formattedDate = activeUser?.createdAt
    ? new Date(activeUser.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "August 5, 2026";

  const displayAvatar = user?.profileImageUrl || user?.avatar || formData.avatar;

  return (
   <div className="flex-1 bg-white overflow-y-auto h-full flex flex-col font-[Inter] relative min-h-screen">

  <div className="max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6">
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-[#F5F6F8] hover:text-[#12151C] cursor-pointer bg-white border border-[#E5E7EB]"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>

    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
      <div className="h-32 bg-linear-to-r from-teal-600 to-teal-500 relative"></div>

      <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between -mt-16 gap-4">
        <div className="flex items-end gap-4">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full ring-4 ring-white bg-[#F5F6F8] overflow-hidden shadow-md flex items-center justify-center font-bold text-3xl text-[#6B7280]">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setImagePreviewOpen(true);
                  }}
                />
              ) : (
                formData.fullName?.[0]?.toUpperCase()
              )}
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm bg-[#12151C] text-white hover:bg-[#2A2E38] cursor-pointer"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="px-6 mb-4">
        <h2 className="heading text-xl font-bold text-[#12151C]">
          {formData.fullName}
        </h2>
        <p className="text-sm text-[#6B7280]">@{formData.username}</p>
      </div>

      <div className="px-6 pb-6 border-t border-[#E5E7EB] pt-4">
        <h3 className="text-sm font-semibold text-[#12151C] mb-2">
          Bio
        </h3>

        {formData.bio ? (
          <p className="text-sm text-[#6B7280] leading-relaxed">
            {formData.bio}
          </p>
        ) : (
          <p className="text-sm italic text-[#9CA3AF]">
            No bio added yet.
          </p>
        )}
      </div>

      <div className="px-6 pb-6 border-t border-[#E5E7EB] pt-4">
        <h3 className="text-sm font-semibold text-[#12151C] mb-2">
          Gender
        </h3>

        {formData.gender ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-600 capitalize">
            {formData.gender}
          </span>
        ) : (
          <p className="text-sm italic text-[#9CA3AF]">
            No gender specified.
          </p>
        )}
      </div>
    </div>

    <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-sm">
      <div className="mb-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h2 className="heading text-lg md:text-xl font-bold text-[#12151C]">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            Your account information and profile details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] transition hover:bg-[#F5F6F8]">
          <div className="flex items-center gap-2 text-[#12151C] mb-1 font-bold">
            <User className="h-4 w-4 text-teal-600" />
            <span className="text-xs uppercase tracking-wider">
              Full Name
            </span>
          </div>

          <p className="text-[13px] font-normal text-[#6B7280] pl-6">
            {formData.fullName || (
              <span className="text-[#9CA3AF]">
                Not provided
              </span>
            )}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] transition hover:bg-[#F5F6F8]">
          <div className="flex items-center gap-2 text-[#12151C] mb-1 font-bold">
            <AtSign className="h-4 w-4 text-teal-600" />
            <span className="text-xs uppercase tracking-wider">
              Username
            </span>
          </div>

          <p className="text-[13px] font-normal text-[#6B7280] pl-6">
            {formData.username ? (
              `${formData.username}`
            ) : (
              <span className="text-[#9CA3AF]">
                Not provided
              </span>
            )}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] transition hover:bg-[#F5F6F8]">
          <div className="flex items-center gap-2 text-[#12151C] mb-1 font-bold">
            <Mail className="h-4 w-4 text-teal-600" />
            <span className="text-xs uppercase tracking-wider">
              Email Address
            </span>
          </div>

          <p className="text-[13px] font-normal text-[#6B7280] pl-6 break-all">
            {formData.email || (
              <span className="text-[#9CA3AF]">
                Not provided
              </span>
            )}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] transition hover:bg-[#F5F6F8]">
          <div className="flex items-center gap-2 text-[#12151C] mb-1 font-bold">
            <Calendar className="h-4 w-4 text-teal-600" />
            <span className="text-xs uppercase tracking-wider">
              Member Since
            </span>
          </div>

          <p className="text-[13px] font-normal text-[#6B7280] pl-6">
            {formattedDate || (
              <span className="text-[#9CA3AF]">
                Unknown
              </span>
            )}
          </p>
        </div>
      </div>
    </div>

    <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-sm">
  <div className="mb-6 pb-4 border-b border-[#E5E7EB]">
    <h2 className="heading text-lg md:text-xl font-bold text-[#12151C]">
      Friends
    </h2>

    <p className="mt-1 text-sm text-[#6B7280]">
      People you are connected with.
    </p>
  </div>

  {friendsLoading ? (
    <div className="flex items-center justify-center py-10">
      <div className="w-6 h-6 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
    </div>
  ) : friends.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-14 h-14 rounded-full bg-[#F5F6F8] flex items-center justify-center">
        <Users className="w-7 h-7 text-[#9CA3AF]" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-[#12151C]">
        No friends yet
      </h3>

      <p className="mt-1 text-sm text-[#9CA3AF]">
        You don't have any friends yet.
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {friends.map((friend) => (
        <div
          key={friend._id}
          className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#F5F6F8] transition"
        >
          <div className="w-14 h-14 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center shrink-0">
            {friend.profileImageUrl ? (
              <img
                src={friend.profileImageUrl}
                alt={friend.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-teal-600">
                {friend.fullName
                  ?.trim()
                  .split(" ")
                  .slice(0, 2)
                  .map((name) => name[0]?.toUpperCase())
                  .join("")}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#12151C] truncate">
              {friend.fullName}
            </h3>

            <p className="text-sm text-[#6B7280] truncate">
              @{friend.username}
            </p>
          </div>
        </div>
      ))}
    </div>
  )} 
</div>

    <div className="w-full flex items-center justify-center">
      <button
        type="button"
        onClick={() => setIsLoggingOut(true)}
        className="w-fit flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#12151C] bg-white border border-[#E5E7EB] hover:bg-[#F5F6F8] transition-colors cursor-pointer"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  </div>

  {imagePreviewOpen && displayAvatar && (
    <div
      onClick={() => setImagePreviewOpen(false)}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl max-h-[85vh]"
      >
        <img
          src={displayAvatar}
          alt="Profile"
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
        />

        <button
          onClick={() => setImagePreviewOpen(false)}
          className="absolute -top-3 -right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#6B7280] shadow-lg hover:bg-[#F5F6F8] hover:text-[#12151C] cursor-pointer"
        >
          <X size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  )}

  {isLoggingOut && (
    <div
      onClick={() => setIsLoggingOut(false)}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm rounded-2xl border border-[#E5E7EB] shadow-2xl p-6"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F5F6F8]">
            <LogOut className="w-5 h-5 text-[#12151C]" />
          </div>

          <h3 className="heading text-lg font-bold text-[#12151C]">
            Logout
          </h3>
        </div>

        <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
          Are you sure you want to logout from your account?
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setIsLoggingOut(false)}
            className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#6B7280] hover:bg-[#F5F6F8] hover:text-[#12151C] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl bg-[#12151C] text-sm font-medium text-white hover:bg-[#2A2E38] transition-colors cursor-pointer"
          >
            Confirm Logout
          </button>
        </div>
      </div>
    </div>
  )}

  {isEditing && (
    <div
      onClick={() => setIsEditing(false)}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-[#E5E7EB] rounded-2xl space-y-6 relative no-scrollbar"
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 top-0 bg-white z-10">
          <h3 className="heading text-lg font-bold text-[#12151C]">
            Edit Profile
          </h3>

          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-1 hover:bg-[#F5F6F8] rounded-lg text-[#6B7280] cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="relative group w-28 h-28 rounded-full overflow-hidden border-4 border-[#E5E7EB] shadow-md flex items-center justify-center">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-teal-600 flex items-center justify-center text-white text-3xl font-bold">
                {formData.fullName?.charAt(0).toUpperCase()}
              </div>
            )}

            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center">
              <Camera className="w-7 h-7 text-white" />

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <p className="text-xs text-[#6B7280]">
            Click your photo to change it
          </p>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#12151C]">
            <User className="w-4 h-4 text-teal-600" />
            Full Name
          </label>

          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#12151C]">
            <FileText className="w-4 h-4 text-teal-600" />
            Bio
          </label>

          <textarea
            rows={4}
            maxLength={150}
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell people something about yourself..."
            className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />

          <div className="mt-1 text-right text-xs text-[#9CA3AF]">
            {formData.bio?.length || 0}/150
          </div>
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#12151C]">
            <Users className="w-4 h-4 text-teal-600" />
            Gender
          </label>

          <div className="grid grid-cols-3 gap-3">
            {["male", "female", "other"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setFormData({ ...formData, gender: g })}
                className={`rounded-xl border py-3 text-sm font-medium capitalize cursor-pointer ${
                  formData.gender === g
                    ? "border-teal-600 bg-teal-50 text-teal-600"
                    : "border-[#E5E7EB] hover:border-[#CBD5E1] text-[#6B7280]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#6B7280] hover:text-[#12151C] hover:bg-[#F5F6F8] cursor-pointer flex items-center gap-2"
          >
            <X size={16} strokeWidth={2} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#12151C] text-sm font-medium text-white hover:bg-[#2A2E38] cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )}
</div>
  );
};

export default Profile;