import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
      minlength: [3, "Full Name must be at least 3 characters"],
      maxlength: [50, "Full Name cannot exceed 50 characters"],
    },
    username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    bio: {
  type: String,
  default: "",
  maxlength: 150,
},

gender: {
  type: String,
  enum: ["male", "female", "other"],
 default: null,
},

profileKey: {
  type: String,
  default: "",
},

    lastLogin: {
  type: Date,
  default: null,
},
  },
  {
    timestamps: true,
  }
);

const friendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },

    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
const Friend = mongoose.model("Friend", friendshipSchema);


export  {User,Friend};