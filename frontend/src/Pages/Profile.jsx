import React, { useState, useEffect } from "react";
import { User, Mail,LogOut, AtSign, Calendar, Camera, Save, ArrowLeft, FileText, Users, X } from "lucide-react";
import { useUser } from "../Context/userContext";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

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
    <div className="flex-1 bg-slate-50 overflow-y-auto h-full flex flex-col font-sans relative min-h-screen">
     
      <div className="max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900  cursor-pointer bg-white border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back 
        </button>

        
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-600 relative"></div>
          <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between -mt-16 gap-4">
            <div className="flex items-end gap-4">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full ring-4 ring-white bg-slate-200 overflow-hidden shadow-md flex items-center justify-center font-bold text-3xl text-slate-600">
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt="Profile"
                      className="w-full h-full object-cover  cursor-pointer"
                      onClick={()=>{
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
                className="px-5 py-2.5 rounded-xl font-medium text-sm  shadow-sm bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          </div>

          
          <div className="px-6 mb-4">
            <h2 className="text-xl font-bold text-slate-900">{formData.fullName}</h2>
            <p className="text-sm text-slate-500">@{formData.username}</p>
          </div>

         
          <div className="px-6 pb-6 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Bio</h3>
            {formData.bio ? (
              <p className="text-sm text-slate-600 leading-relaxed">{formData.bio}</p>
            ) : (
              <p className="text-sm italic text-slate-400">No bio added yet.</p>
            )}
          </div>

      
          <div className="px-6 pb-6 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Gender</h3>
            {formData.gender ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                {formData.gender}
              </span>
            ) : (
              <p className="text-sm italic text-slate-400">No gender specified.</p>
            )}
          </div>
        </div>

       
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">
                Personal Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your account information and profile details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition hover:bg-slate-50">
              <div className="flex items-center gap-2 text-slate-700 mb-1 font-bold">
                <User className="h-4 w-4 text-slate-700" />
                <span className="text-xs uppercase tracking-wider">Full Name</span>
              </div>
              <p className="text-[13px] italic font-normal text-slate-500 pl-6">
                {formData.fullName || <span className="text-slate-400">Not provided</span>}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition hover:bg-slate-50">
              <div className="flex items-center gap-2 text-slate-700 mb-1 font-bold">
                <AtSign className="h-4 w-4 text-slate-700" />
                <span className="text-xs uppercase tracking-wider">Username</span>
              </div>
              <p className="text-[13px] italic font-normal text-slate-500 pl-6">
                {formData.username ? `${formData.username}` : <span className="text-slate-400">Not provided</span>}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition hover:bg-slate-50">
              <div className="flex items-center gap-2 text-slate-700 mb-1 font-bold">
                <Mail className="h-4 w-4 text-slate-700" />
                <span className="text-xs uppercase tracking-wider">Email Address</span>
              </div>
              <p className="text-[13px] italic font-normal text-slate-500 pl-6 break-all">
                {formData.email || <span className="text-slate-400">Not provided</span>}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition hover:bg-slate-50">
              <div className="flex items-center gap-2 text-slate-700 mb-1 font-bold">
                <Calendar className="h-4 w-4 text-slate-700" />
                <span className="text-xs uppercase tracking-wider">Member Since</span>
              </div>
              <p className="text-[13px] italic font-normal text-slate-500 pl-6">
                {formattedDate || <span className="text-slate-400">Unknown</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          <button
  type="button"
   onClick={() => setIsLoggingOut(true)}
  className="w-fit flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 bg-red-50 border border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
>
  <LogOut className="w-5 h-5" />
  Logout
</button>
          

        </div>


      </div>


      {imagePreviewOpen && displayAvatar && (
  <div
    onClick={() => setImagePreviewOpen(false)}
    className="fixed inset-0 z-100 flex items-center justify-center bg-black/70  p-4"
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
        className="absolute -top-3 -right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white text-gray-400  shadow-lg hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
      >
        <X size={18} strokeWidth={3}/>
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
      className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6"
    >
      <div className="flex items-center justify-center gap-3 mb-2">
  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
    <LogOut className="w-5 h-5 text-slate-600" />
  </div>

  <h3 className="text-lg font-bold text-slate-900">
    Logout
  </h3>
</div>


      <p className="mt-2 text-sm text-slate-500 leading-relaxed">
        Are you sure you want to logout from your account?
      </p>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={() => setIsLoggingOut(false)}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
         onClick={handleLogout}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
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
            className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-200 rounded-2xl space-y-6 relative  no-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500  cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>

            
            <div className="flex flex-col items-center gap-2">
              <div className="relative group w-28 h-28 rounded-full overflow-hidden border-4 border-slate-200 shadow-md flex items-center justify-center">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                    {formData.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}

                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100  cursor-pointer flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500">Click your photo to change it</p>
            </div>

            
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText className="w-4 h-4" />
                Bio
              </label>
              <textarea
                rows={4}
                maxLength={150}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell people something about yourself..."
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none  focus:border-blue-500"
              />
              <div className="mt-1 text-right text-xs text-slate-400">
                {formData.bio?.length || 0}/150
              </div>
            </div>

            
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users className="w-4 h-4" />
                Gender
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["male", "female", "other"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`rounded-xl border py-3 text-sm font-medium capitalize  cursor-pointer ${
                      formData.gender === g
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-slate-300 hover:border-slate-400 text-slate-600"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

           
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer flex items-center gap-2"
              >
                <X size={16} strokeWidth={2} />

                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer flex items-center gap-2"
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