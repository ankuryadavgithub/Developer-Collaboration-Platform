import React from "react";
import StatsCard from "./StatsCard.jsx";
import { Folder, Play, CheckCircle2Icon, CircleAlert, CheckCircle, Code } from "lucide-react";

const getStatsData = (kpis) => {
  return [
    {
      title: "Active Projects",
      value: kpis?.totalProjects || 0,
      subtitle: "In this workspace",
      icon: Folder,
      borderColor: "border-violet-500/30",
      bgColor: "bg-gradient-to-br from-violet-950/60 to-slate-900",
      iconColor: "text-violet-400",
      bgIcon: "bg-violet-500/20",
      hoverBorderColor: "hover:border-violet-400",
    },
    {
      title: "Active Sprints",
      value: kpis?.activeSprints || 0,
      subtitle: "Currently running",
      icon: Play,
      borderColor: "border-sky-500/30",
      bgColor: "bg-gradient-to-br from-cyan-950/60 to-slate-900",
      iconColor: "text-sky-400",
      bgIcon: "bg-sky-500/20",
      hoverBorderColor: "hover:border-sky-400",
    },
    {
      title: "Tasks Completed",
      value: kpis?.tasksCompleted || 0,
      subtitle: "Across all projects",
      icon: CheckCircle2Icon,
      borderColor: "border-blue-500/30",
      bgColor: "bg-gradient-to-br from-blue-950/60 to-slate-900",
      iconColor: "text-blue-400",
      bgIcon: "bg-blue-500/20",
      hoverBorderColor: "hover:border-blue-400",
    },
    {
      title: "Open Bugs",
      value: kpis?.openBugs || 0,
      subtitle: "Requires attention",
      icon: CircleAlert,
      borderColor: "border-red-500/30",
      bgColor: "bg-gradient-to-br from-red-950/60 to-slate-900",
      iconColor: "text-red-400",
      bgIcon: "bg-red-500/20",
      hoverBorderColor: "hover:border-red-400",
    },
    {
      title: "Total Sprints",
      value: kpis?.totalSprints || 0,
      subtitle: "Historical data",
      icon: Code,
      borderColor: "border-orange-500/30",
      bgColor: "bg-gradient-to-br from-orange-950/60 to-slate-900",
      iconColor: "text-orange-400",
      bgIcon: "bg-orange-500/20",
      hoverBorderColor: "hover:border-orange-400",
    },
    {
      title: "Total Tasks",
      value: kpis?.totalTasks || 0,
      subtitle: "Total recorded",
      icon: CheckCircle,
      borderColor: "border-purple-500/30",
      bgColor: "bg-gradient-to-br from-purple-950/60 to-slate-900",
      iconColor: "text-purple-400",
      bgIcon: "bg-purple-500/20",
      hoverBorderColor: "hover:border-purple-400",
    },
  ];
};

const StatsGrid = ({ kpis }) => {
  const stats = getStatsData(kpis);

  return (
    <div className="w-full bg-[#111827] rounded-2xl">
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-2">
        {stats.map((stat) => (
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