import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

function Login() {
  return(
    <div className="min-h-screen bg-[#0F0E47] flex items-center justify-center">
      <div className="bg-[#8686AC] h-120 w-100 rounded-2xl">
        <div id="login-icon" className="flex items-center justify-center">
          <h1 className="text-[#272757] mt-2 text-3xl font-bold">Login</h1>
        </div>
        <div id="fields">
          <div id="name" className="mt-14 text-[#0F0E47] flex flex-col">
            <label htmlFor="name" className="ml-4 ">Username</label>
            <input type="text" className="border-2 w-90 ml-4 p-1" placeholder="Enter You UserName" />
          </div>
          <div id="password" className="mt-2 text-[#0F0E47] flex flex-col">
            <label htmlFor="name" className="ml-4 ">Password</label>
            <input type="text" className="border-2 w-90 ml-4 p-1" placeholder="Enter Your Password" />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;