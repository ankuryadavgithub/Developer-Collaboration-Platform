import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import googleIcon from "../assets/google.svg";
import githubIcon from "../assets/github.svg";
import eyeOn from "../assets/eyeOn.svg"
import eyeOff from "../assets/eyeOff.svg"

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return(
    <div className="min-h-screen bg-linear-to-br from-[#D3D3FF] via-[#9400D3] via-[#D8BFD8] to-[#ED80E9] flex justify-center items-start lg:items-center px-4 py-6 sm:px-8  lg:px-20">
      <form
        id="login-window"
        className="w-full max-w-2xl rounded-3xl lg:rounded-[36px] overflow-hidden bg-white border border-white/20 shadow-2xl lg:min-h-[500px]"
      >

        {/* Right Side */}
        <div className="w-full bg-linear-to-br from-[#FFFBF5] via-[#FFF7ED] to-[#FEF3C7] flex items-center justify-center py-2 lg:py-6 overflow-y-auto">
          <div className="w-full p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Login into your Account
            </h1>
            <p className="mt-1 mb-6 text-sm sm:text-base text-slate-500">
              Please enter your login credentials :
            </p>

            {/* Username & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Username
                </label>
                <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-3 hover:border-violet-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-300 transition-all duration-200">
                  <User size={18} className="text-violet-500 shrink-0" />
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    className="ml-3 w-full bg-transparent outline-none placeholder:text-slate-400 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-3 hover:border-violet-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-300 transition-all duration-200">
                  <Lock size={18} className="text-violet-500 shrink-0" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="ml-3 w-full bg-transparent outline-none placeholder:text-slate-400 text-sm sm:text-base"
                  />
                  <button 
                  type="button"
                  onClick={()=>setShowPassword(!showPassword)} 
                  className="cursor-pointer">
                    <img src={showPassword ? eyeOff : eyeOn} 
                    alt="toggle-password"
                    className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Terms & Privacy */}
            <div className="flex items-start gap-3 mt-5 mb-5">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-violet-600 cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-sm leading-6 text-slate-600 cursor-pointer"
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="font-medium text-violet-600 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="font-medium text-violet-600 hover:underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-[#9400D3] via-[#C026D3] to-[#ED80E9] py-3 text-white font-semibold flex items-center justify-center gap-2 hover:from-[#ED80E9] hover:via-[#C026D3] hover:to-[#9400D3] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-500 cursor-pointer"
            >
              Login
              <ArrowRight size={18} />
            </button>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-slate-300"></div>
              <span className="mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Or
              </span>
              <div className="flex-1 border-t border-slate-300"></div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 flex items-center justify-center gap-2 hover:border-violet-300 hover:shadow-sm hover:bg-slate-50 transition-all duration-200 cursor-pointer text-sm font-medium text-slate-700"
              >
                <img src={googleIcon} alt="Google" className="w-5 h-5" />
                Google
              </button>
              <button
                type="button"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 flex items-center justify-center gap-2 hover:border-violet-300 hover:shadow-sm hover:bg-slate-50 transition-all duration-200 cursor-pointer text-sm font-medium text-slate-700"
              >
                <img src={githubIcon} alt="Google" className="w-5 h-5" />
                GitHub
              </button>
            </div>

            {/* Signup Link */}
            <p className="mt-6 text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-violet-600 hover:text-violet-700 hover:underline transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
export default Login;