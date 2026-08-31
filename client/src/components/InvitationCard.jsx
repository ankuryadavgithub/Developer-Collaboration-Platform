import React from "react";
import { Building2, Calendar, User, Check, X, Loader2 } from "lucide-react";

const InvitationCard = ({ invitation, onAccept, onReject, isProcessing }) => {
  return (
    <div className="bg-[#1c1f2e] rounded-xl shadow-lg border border-[#ffffff]/10 hover:border-blue-500/50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
      {/* Left Side: Invitation Details */}
      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
            <Building2 size={22} />
          </div>
          <h3 className="text-xl font-bold text-white">
            {invitation.organization?.name}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-500" />
            <span>
              Invited by{" "}
              <span className="font-semibold text-slate-200">
                {invitation.invitedBy?.username}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 tracking-wide">
              ROLE: {invitation.role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" />
            <span>{new Date(invitation.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Right Side: Actions */}
      <div className="flex w-full md:w-auto gap-3 mt-4 md:mt-0">
        <button
          onClick={() => onReject(invitation.id)}
          disabled={isProcessing}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-400 bg-transparent border border-red-500/30 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <X size={16} />
          )}
          Reject
        </button>
        <button
          onClick={() => onAccept(invitation.id)}
          disabled={isProcessing}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isProcessing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Accept
        </button>
      </div>
    </div>
  );
};

export default InvitationCard;
