import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 transition-all duration-300 hover:border-slate-700 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
