import React from "react";
import StatsCard from "./StatsCard.jsx";
import StatsData from "./StatsData.js";



const StatsGrid = () => {
  return (
    <div className="w-full bg-[#111827] rounded-2xl">
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-2">
        {StatsData.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            borderColor={stat.borderColor}
            bgColor={stat.bgColor}
            iconColor={stat.iconColor}
            hoverBorderColor={stat.hoverBorderColor}
            bgIcon={stat.bgIcon}
          />
        ))}
      </div>
    </div>
  );
};

export default StatsGrid;