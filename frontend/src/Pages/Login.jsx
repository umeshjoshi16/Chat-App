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
     <div className="min-h-screen bg-white text-[#12151C] font-[Inter] flex items-center justify-center px-4">

      

      <div className="w-full max-w-md bg-white rounded-xl border border-[#E5E7EB] p-8">

        <h1 className="heading text-3xl font-bold text-center text-teal-600">
          Welcome Back
        </h1>

        <p className=" sub-heading text-center text-[#6B7280] mt-2 mb-8">
          Login to your account
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >

        
          <div>
            <label className="block mb-2 font-medium text-[#12151C]">
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
                  : "border-[#E5E7EB] focus:ring-teal-600"
              }
              focus:ring`}
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          
          <div>
            <label className="block mb-2 font-medium text-[#12151C]">
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
                    : "border-[#E5E7EB] focus:ring-teal-600"
                }
                focus:ring`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute inset-y-0 right-3 flex items-center text-[#6B7280] hover:text-teal-600 cursor-pointer"
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

         
          <div className="flex items-center justify-end">

            <Link
              // to="/forgot-password"
              className="text-teal-600 text-sm hover:underline"
            >
              Forgot Password?
            </Link>

          </div>

        
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#12151C] hover:bg-[#2A2E38] cursor-pointer py-3 rounded-lg font-semibold text-white transition"
          >
            Login
          </button>

        </form>

       
        <p className="text-center mt-6 text-[#6B7280]">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-teal-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}