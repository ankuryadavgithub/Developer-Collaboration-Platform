// signup.jsx

import { Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import googleIcon from "../assets/google.svg";
import githubIcon from "../assets/github.svg";
import eyeOn from "../assets/eyeOn.svg";
import eyeOff from "../assets/eyeOff.svg";
import { useState } from "react";

function Signup() {
  const [showPassword,setShowPassword] = useState(false);
  const [ConfirmPassword,setConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    roleSelect: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e)=>{
    setFormData({ ...formData, [e.target.id]: e.target.value});
  };

  const handleSubmit = async (e)=>{
    e.preventDefault(); //Avoids page Refreshing
    setError("");

     if (formData.username.length < 3)
       return setError("Username must be at least 3 characters.");
     if (formData.username.includes(" "))
       return setError("Username cannot contain spaces.");
     const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
     if (!passwordRegex.test(formData.password))
       return setError("Password must be at least 8 chars, with 1 number and 1 special char.");
     if (formData.password !== formData.confirmPassword)
       return setError("Passwords do not match!");
     if (!formData.roleSelect) 
      return setError("Please select a role.");


    try{
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            username: formData.username,
            role: formData.roleSelect,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if(!response.ok){
        throw new Error(data.message || "Registration failed");
      }

      alert("Account created Successfully");
      console.log(data);
    }

    catch (err){
      setError(err.message);
    }

    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#D3D3FF] via-[#9400D3] via-[#D8BFD8] to-[#ED80E9] flex justify-center items-start lg:items-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-6">
      <form
        id="window"
        onSubmit={handleSubmit}
        className="w-full max-w-5xl flex flex-col lg:flex-row rounded-3xl lg:rounded-[36px] overflow-hidden bg-white border border-white/20 shadow-2xl lg:min-h-[680px]"
      >
        {/* Left Side */}
        <div className="relative lg:basis-[38%] shrink-0 min-h-[200px] sm:min-h-[240px] lg:min-h-full px-6 py-8 sm:px-8 sm:py-10 bg-linear-to-br from-[#4747b0] via-[#460562] via-[#ce41ce] to-[#4e064bec] text-white flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10"></div>

          <div className="relative z-10 w-full max-w-sm lg:max-w-none mx-auto lg:mx-0">
            <h1 className="text-2xl sm:text-3xl lg:text-[38px] xl:text-[42px] font-bold leading-tight mb-4 lg:mb-6">
              Developer Collaboration Platform
            </h1>

            <p className="text-slate-200 leading-relaxed text-sm sm:text-base lg:text-lg max-w-[280px] mx-auto lg:mx-0">
              Join thousands of developers to collaborate on projects, share
              ideas, participate in discussions, and build amazing software
              together.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="lg:basis-[62%] bg-linear-to-br from-[#FFFBF5] via-[#FFF7ED] to-[#FEF3C7] flex items-center justify-center py-2 lg:py-6 overflow-y-auto">
          <div className="relative w-full max-w-[760px] px-5 py-6 sm:px-8 sm:py-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Create Account
            </h2>
            <p className="mt-1 mb-6 text-sm sm:text-base text-slate-500">
              Join the developer community today.
            </p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {/* Username & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Username
                </label>
                <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 hover:border-violet-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-300 transition-all duration-200">
                  <User size={18} className="text-violet-500 shrink-0" />
                  <input
                    id="username"
                    type="text"
                    minLength={3}
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    className="ml-3 w-full bg-transparent outline-none placeholder:text-slate-400 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="roleSelect"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Role
                </label>
                <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 hover:border-violet-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-300 transition-all duration-200">
                  <select
                    id="roleSelect"
                    required
                    value={formData.roleSelect}
                    onChange={handleChange}
                    className="w-full appearance-none bg-transparent outline-none text-slate-700 cursor-pointer text-sm sm:text-base"
                  >
                    <option value="">Select your role</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="developer">Developer</option>
                    <option value="frontend_developer">
                      Frontend Developer
                    </option>
                    <option value="backend_developer">Backend Developer</option>
                    <option value="fullstack_developer">
                      Full Stack Developer
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 hover:border-violet-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-300 transition-all duration-200">
                <Mail size={18} className="text-violet-500 shrink-0" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="ml-3 w-full bg-transparent outline-none placeholder:text-slate-400 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 hover:border-violet-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-300 transition-all duration-200">
                  <Lock size={18} className="text-violet-500 shrink-0" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="ml-3 w-full bg-transparent outline-none placeholder:text-slate-400 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer"
                  >
                    <img
                      src={showPassword ? eyeOff : eyeOn}
                      alt="toggle-icon"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 hover:border-violet-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-300 transition-all duration-200">
                  <Lock size={18} className="text-violet-500 shrink-0" />
                  <input
                    id="confirmPassword"
                    type={ConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="ml-3 w-full bg-transparent outline-none placeholder:text-slate-400 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPassword(!ConfirmPassword)}
                    className="cursor-pointer"
                  >
                    <img
                      src={ConfirmPassword ? eyeOff : eyeOn}
                      alt="toggle-password"
                      className="w-5 h-5"
                    />
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

            {/* Create Account Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-[#9400D3] via-[#C026D3] to-[#ED80E9] py-3.5 text-white font-semibold flex items-center justify-center gap-2 hover:from-[#ED80E9] hover:via-[#C026D3] hover:to-[#9400D3] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-500 cursor-pointer"
            >
              Create Account
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

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-violet-600 hover:text-violet-700 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Signup;