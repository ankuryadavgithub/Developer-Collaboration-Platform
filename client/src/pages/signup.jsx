import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

function Signup() {
  return (
    <div className=" min-h-screen  bg-blue-400 flex justify-center items-center">      
      <div className="bg-gray-500 h-100 w-100 rounded-4xl ">
        <div className="m-8 text-white font-bold ">Signup</div>
        <div className="">
          <div class="name" className="m-6 flex flex-col">
            <label className="text-red-500 w-20" htmlFor="name">USERNAME</label>
            <input placeholder="Enter your username" className="mt-2 p-1 bg-amber-50 rounded-sm text-black" type="text" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
