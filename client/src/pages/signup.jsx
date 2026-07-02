import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

function Signup() {
  return (
    <div className=" min-h-screen  bg-blue-400 flex justify-center items-center">      
      <div className="bg-gray-500 h-100 w-100 rounded-3xl ">
        <h1 className="text-3xl font-bold text-white text-center pt-2">SignUp</h1>
          <div className="m-6 flex flex-col">
            <label className="text-red-500" htmlFor="name">USERNAME</label>
            <input id ="name" placeholder="Enter your username" className="mt-2 p-2 bg-white rounded text-black" type="text" />
          </div>
      </div>
    </div>
  );
}

export default Signup;
