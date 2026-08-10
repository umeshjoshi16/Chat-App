import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { useUser } from "../Context/userContext";



const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});


const schema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
  });
const onSubmit = async (data) => {
  const loading = toast.loading("Signing In...");

  try {
    const response = await api.post("/auth/login", {
      email: data.email,
      password: data.password,
    });
    console.log(response);
    setUser(response.data.user);
    reset();

    navigate("/home");
  } catch (error) {
    toast.error("Login failed");
  } finally {
    toast.dismiss(loading);
  }
};
 

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 p-8">

        <h1 className="text-3xl font-bold text-center text-indigo-600">
          Welcome Back
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Login to your account
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >

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
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-indigo-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/*  Forgot Password */}
          <div className="flex items-center justify-end">


            <Link
              to="/forgot-password"
              className="text-indigo-600 text-sm hover:underline"
            >
              Forgot Password?
            </Link>

          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer py-3 rounded-lg font-semibold text-white transition
            `}
          >
            Login
          </button>

        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}