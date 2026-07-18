import React from "react";
import Card from "../../common/Card";
import { ArrowRight } from "lucide-react";

const pipelineSteps = [
  {
    name: "Build",
    status: "Passed",
    time: "2 min ago",
    icon: "✅",
    color: "text-green-400",
  },
  {
    name: "Tests",
    status: "143 Passed",
    time: "2 min ago",
    icon: "✅",
    color: "text-green-400",
  },
  {
    name: "Lint",
    status: "Passed",
    time: "2 min ago",
    icon: "✅",
    color: "text-green-400",
  },
  {
    name: "Deployment",
    status: "Deployed",
    time: "5 min ago",
    icon: "🚀",
    color: "text-orange-400",
  },
];

export const CICDStatus = () => {
  return (
    <Card className="h-full min-h-[320px] flex flex-col justify-between">
      <h3 className="text-lg font-semibold text-slate-100">CI/CD Status</h3>

      <div className="mt-4">
        {pipelineSteps.map((step) => (
          <div
            key={step.name}
            className="flex items-center justify-between py-4 border-b border-slate-800 gap-2">
            <div className="text-sm text-slate-400">{step.name}</div>

            <div
              className={`flex items-center text-sm font-medium ${step.color}`}
            >
              <span>{step.icon}</span>
              <span>{step.status}</span>
            </div>

            <div className="text-xs text-slate-500">{step.time}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button className=" flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
          View Pipeline
          <ArrowRight size={16} />
        </button>
      </div>
    </Card>
  );
};

export default CICDStatus;
