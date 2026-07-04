import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

function Signup() {
  return (
    <div className=" min-h-screen  bg-linear-to-br from-[#6A89A7] via-[#BDDDFC] via-[#88BDF2] to-[#384959] flex justify-center items-center">
      <div className="flex w-full max-w-6xl min-h-[650px] rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* /left side */}
        <div className="flex-1 bg-linear-to-br from-[#3B0764] via-[#7E1E68] to-[#F97316] text-white p-10 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6">
            Developer Collaboration Platform
          </h1>
          <p className="text-slate-300 leading-7">
            Join thousands of developers to collaborate on projects, share
            ideas, participate in discussions, and build amazing software
            together.
          </p>
        </div>

        {/* right side */}
        <div className="flex-1 bg-linear-to-br from-[#FFFBF5] via-[#FFF7ED] to-[#FEF3C7] flex items-center justify-center">
          <div className="w-full max-w-md p-8">
            <h2 className="text-3xl font-bold text-slate-800">
              Create Account
            </h2>
            <p className=" text-slate-500 mt-2 mb-8">
              Join the developer community today.
            </p>

            {/* username */}
            <div className="mb-5">
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2"
              >
                Username
              </label>
              <div className="flex items-center border rounded-xl px-4 py-3  focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-violet-400 transition">
                <User size={18} className="text-violet-500" />
                <input
                  className="ml-3 w-full outline-none bg-transparent"
                  id="username"
                  type="text"
                  placeholder="enter username"
                />
              </div>
            </div>

            {/* email */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="flex items-center border rounded-xl px-4 py-3  focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-violet-400 transition">
                <Mail size={18} className="text-violet-500" />
                <input
                  className="ml-3 w-full outline-none bg-transparent"
                  id="email"
                  type="email"
                  placeholder="enter email"
                />
              </div>
            </div>

            {/* role selection */}
            <label
              htmlFor="roleSelect"
              className="block text-sm font-medium mb-2"
            >
              Role
            </label>
            <div className="flex items-center border rounded-xl px-4 py-3  focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-violet-400 transition">
              <select
                name="roleSelection"
                id="roleSelect"
                className="w-full bg-transparent outline-none text-slate-700 cursor-pointer"
              >
                <option value="" disabled selected>
                  Select your role
                </option>
                <option value="project_manager">Project Manager</option>
                <option value="Developer">Developer</option>
                <option value="frontend_developer">Frontend Developer</option>
                <option value="backend_developer">Backend Developer</option>
                <option value="cloud_engineer">Cloud Engineer</option>
                <option value="data_scientist">Data Scientist</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            {/* password */}
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <div className="flex items-center border rounded-xl px-4 py-3  focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-violet-400 transition">
                <Lock size={18} className="text-violet-500" />
                <input
                  className="ml-3 w-full outline-none bg-transparent"
                  id="password"
                  type="password"
                  placeholder="enter password"
                />
              </div>
            </div>

            {/* confirm password */}
            <div className="mb-5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
              >
                Confirm Password
              </label>
              <div className="flex items-center border rounded-xl px-4 py-3  focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-violet-400 transition">
                <Lock size={18} className="text-violet-500" />
                <input
                  className="ml-3 w-full outline-none bg-transparent"
                  id="confirmPassword"
                  type="password"
                  placeholder="confirm password"
                />
              </div>
            </div>

            {/* terms and policy checkbox */}
            <div className="flex items-center mb-6">
              <input
                className="h-4 w-4 rounded border-slate-300 text-blue-600 mr-3"
                type="checkbox"
              />
              <span className="text-sm text-gray-600">
                I agree to the terms and policy
              </span>
            </div>

            {/* create account button */}
            <button className="w-full rounded-xl bg-linear-to-br from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white py-3 font-semibold flex justify-center items-center hover:scale-[1.02] active:scale-95 transition-all duration-200 gap-2 ">
              Create Account
              <ArrowRight size={18} />
            </button>

            {/* divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t"></div>
              <span className="mx-4 text-sm text-gray-400">OR</span>
              <div className="flex-1 border-t"></div>
            </div>

            {/*Login with google button  */}
            <button className="w-full rounded-xl border py-3 flex items-center justify-center gap-2 hover:bg-slate-100 transition duration-200">
              <Mail size={18} />
              Continue with Google
            </button>

            {/* login with github button */}
            <button className="w-full rounded-xl border py-3 mt-3 gap-2 flex items-center justify-center hover:bg-slate-100 transition duration-200">
              <Mail size={18} />
              Continue with Github
            </button>
            <p className="text-center mt-6 text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
