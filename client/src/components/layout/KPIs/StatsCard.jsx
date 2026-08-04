import React from "react";

const StatsCard = ({ title, value, subtitle, icon: Icon, borderColor, bgColor, iconColor, hoverBorderColor, bgIcon}) => {
  return (
    <div
      className={`bg-slate-900 border ${borderColor} ${bgColor} min-h-[160px] flex flex-col justify-between rounded-2xl p-5 text-white hover:scale-[1.02] ${hoverBorderColor} transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <span className="text-[13px] text-slate-300 pr-2 line-clamp-2">{title}</span>
        <div className={`p-3 rounded-full ${bgIcon}`}>
          <Icon className={`${iconColor}`} size={16} />
        </div>
      </div>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-auto pt-2 truncate">{value}</h2>
      <p className="text-xs text-slate-400 mt-2 truncate">{subtitle}</p>
    </div>
  );
};

export default StatsCard;