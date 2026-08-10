import { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});


const schema = yup.object({
  fullName: yup.string().required("Full Name is required").min(3, "Full Name must be at least 3 characters").max(50, "Full Name cannot exceed 50 characters"),

    username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers and underscore are allowed"
    ),

  email: yup.string().required("Email is required").email("Enter a valid email address"),

  password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters").matches(/[A-Z]/, "Must contain at least one uppercase letter").matches(/[a-z]/, "Must contain at least one lowercase letter").matches(/[0-9]/, "Must contain at least one number").matches(/[!@#$%^&*(),.?":{}|<>]/,"Must contain at least one special character"
    ),

  confirmPassword: yup.string().required("Confirm Password is required").oneOf([yup.ref("password")], "Passwords do not match"),
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const [usernameStatus, setUsernameStatus] = useState("");
const [checkingUsername, setCheckingUsername] = useState(false);



  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
     watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
  });
  const username = watch("username");

  useEffect(() => {
  if (!username) {
    setUsernameStatus("");
    return;
  }

  const normalizedUsername = username.trim().toLowerCase();

  if (normalizedUsername.length < 3) {
    setUsernameStatus("");
    return;
  }

  const timer = setTimeout(async () => {
    try {
      setCheckingUsername(true);

      const { data } = await api.get("/auth/check-username", {
        params: {
          username: normalizedUsername,
        },
      });

      setUsernameStatus(data.available ? "available" : "taken");
    } catch (error) {
      setUsernameStatus("");
    } finally {
      setCheckingUsername(false);
    }
  }, 500);

  return () => clearTimeout(timer);
}, [username]);

const onSubmit = async (data) => {
  const loading = toast.loading("Creating account...");
  if (checkingUsername) {
  toast.error("Please wait while we check the username.");
  return;
}

 if (usernameStatus !== "available") {
  toast.error("Please choose a valid available username.");
  return;
}

  try {
    const response = await api.post("/auth/register", {
      fullName: data.fullName,
        username: data.username.trim().toLowerCase(),
      email: data.email,
      password: data.password,
    });

    toast.success("Account created successfully!");

    reset();

    navigate("/login");
  } catch (error) {
    toast.error("Registration failed");
  } finally {
    toast.dismiss(loading);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white my-5 rounded-xl shadow-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-center text-indigo-600">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Register a new account
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Full Name */}
          <div>
            <label className="block mb-2 font-medium">
              Full Name*
            </label>

            <input
              type="text"
              placeholder="Aakash Oli"
              {...register("fullName")}
              className={`w-full px-4 py-3 rounded-lg border outline-none transition
              ${
                errors.fullName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }
              focus:ring`}
            />

            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>


          {/*username */}
         
          <div>
  <label className="block mb-2 font-medium">
    Username*
  </label>

  <input
    type="text"
    placeholder="umesh"
    {...register("username")}
    className={`w-full px-4 py-3 rounded-lg border outline-none transition
    ${
      errors.username
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-indigo-500"
    }
    focus:ring`}
  />

  {errors.username && (
    <p className="text-red-500 text-sm mt-1">
      {errors.username.message}
    </p>
  )}

  {!errors.username && checkingUsername && (
    <p className="text-sm text-gray-500 mt-1">
      Checking username...
    </p>
  )}

  {!errors.username &&
    !checkingUsername &&
    usernameStatus === "available" && (
      <p className="text-green-600 text-sm mt-1">
        ✓ Username is available
      </p>
    )}

  {!errors.username &&
    !checkingUsername &&
    usernameStatus === "taken" && (
      <p className="text-red-600 text-sm mt-1">
        ✗ Username is already taken
      </p>
    )}
</div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium">
              Email*
            </label>

            <input
              type="email"
              placeholder="example@gmail.com"
              {...register("email")}
              className={`w-full px-4 py-3 rounded-lg border outline-none transition
              ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }
              focus:ring`}
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
<div>
  <label className="block mb-2 font-medium">
    Password*
  </label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="********"
      {...register("password")}
      className={`w-full px-4 py-3 pr-12 rounded-lg border outline-none transition
      ${
        errors.password
          ? "border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:ring-indigo-500"
      }
      focus:ring`}
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute cursor-pointer inset-y-0 right-3 flex items-center text-gray-500 hover:text-indigo-600"
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>

  {errors.password && (
    <p className="text-red-500 text-sm mt-1">
      {errors.password.message}
    </p>
  )}
</div>

         {/* Confirm Password */}
<div>
  <label className="block mb-2 font-medium">
    Confirm Password*
  </label>

  <div className="relative">
    <input
      type={showConfirmPassword ? "text" : "password"}
      placeholder="********"
      {...register("confirmPassword")}
      className={`w-full px-4 py-3 pr-12 rounded-lg border outline-none transition
      ${
        errors.confirmPassword
          ? "border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:ring-indigo-500"
      }
      focus:ring`}
    />

    <button
      type="button"
      onClick={() =>
        setShowConfirmPassword(!showConfirmPassword)
      }
      className="absolute cursor-pointer inset-y-0 right-3 flex items-center text-gray-500 hover:text-indigo-600"
    >
      {showConfirmPassword ? (
        <EyeOff size={20} />
      ) : (
        <Eye size={20} />
      )}
    </button>
  </div>

  {errors.confirmPassword && (
    <p className="text-red-500 text-sm mt-1">
      {errors.confirmPassword.message}
    </p>
  )}
</div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full cursor-pointer py-3 rounded-lg font-semibold text-white transition
              ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {isSubmitting ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}