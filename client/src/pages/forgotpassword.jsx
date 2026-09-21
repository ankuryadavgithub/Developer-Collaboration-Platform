import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";

function ForgotPassword() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#D3D3FF] via-[#9400D3] via-[#D8BFD8] to-[#ED80E9] flex justify-center items-center px-4 py-6 sm:px-8 lg:px-20">
      <div className="w-full max-w-2xl rounded-3xl lg:rounded-[36px] overflow-hidden bg-white border border-white/20 shadow-2xl">

        <div className="w-full bg-linear-to-br from-[#FFFBF5] via-[#FFF7ED] to-[#FEF3C7] py-6">
          <div className="w-full p-8">

            {/* Heading */}
            <h1 className="text-3xl font-bold text-slate-800">
              Forgot Password
            </h1>

            <p className="mt-2 mb-8 text-slate-500">
              Enter your registered email address and we'll send you a password
              reset link.
            </p>

            {/* Email */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Email Address
              </label>

              <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-3 hover:border-violet-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-300 transition-all duration-200">
                <Mail size={18} className="text-violet-500 shrink-0" />

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  className="ml-3 w-full bg-transparent outline-none placeholder:text-slate-400 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Button */}
            <button
              className="w-full rounded-xl bg-gradient-to-r from-[#9400D3] via-[#C026D3] to-[#ED80E9] py-3 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              Send Reset Link
              <ArrowRight size={18} />
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-300"></div>

              <span className="mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Or
              </span>

              <div className="flex-1 border-t border-slate-300"></div>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-slate-600">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-violet-600 hover:text-violet-700 hover:underline"
              >
                Login
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;

