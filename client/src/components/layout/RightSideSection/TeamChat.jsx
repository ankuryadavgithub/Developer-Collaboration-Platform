import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function TeamChat({ orgId, workspaceId }) {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!orgId || !workspaceId) return undefined;
    setLoading(true);
    axios.get(`${API}/api/organizations/${orgId}/workspaces/${workspaceId}/chat/channels`, { withCredentials: true })
      .then((res) => { if (active) { setChannels(res.data.data); setChannel(res.data.data.find((item) => item.name === "general") || res.data.data[0]); } })
      .catch((err) => active && setError(err.response?.data?.message || "Unable to load chat."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [orgId, workspaceId]);

  useEffect(() => {
    let active = true;
    if (!channel) return undefined;
    setLoading(true); setMessages([]);
    axios.get(`${API}/api/organizations/${orgId}/workspaces/${workspaceId}/chat/channels/${channel.id}/messages`, { params: { page: 1, limit: 50 }, withCredentials: true })
      .then((res) => { if (active) setMessages(res.data.data); })
      .catch((err) => active && setError(err.response?.data?.message || "Unable to load messages."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [channel, orgId, workspaceId]);

  return (
    <div className="bg-[#161822] rounded-xl p-5 border border-white/5 min-h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">
          Team Chat <span className="text-[#8b92a5] font-normal">(Recent)</span>
        </h3>
        <button onClick={() => navigate(`/organizations/${orgId}/workspaces/${workspaceId}/chat`)} className="text-indigo-400 hover:text-indigo-300 text-xs">View all</button>
      </div>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <div className="flex-1 min-h-[190px] max-h-[280px] overflow-y-auto space-y-3 pr-1">
        {loading ? <p className="text-center text-xs text-slate-500 pt-8">Loading recent messages...</p> : messages.length === 0 ? <p className="text-center text-xs text-slate-500 pt-8">No team messages yet.</p> : messages.slice(-3).reverse().map((message) => <button key={message.id} onClick={() => navigate(`/organizations/${orgId}/workspaces/${workspaceId}/chat`)} className="flex w-full gap-2 text-left"><div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-center leading-7 text-xs overflow-hidden">{message.sender?.avatar ? <img src={message.sender.avatar} alt="" className="w-full h-full object-cover" /> : (message.sender?.username || "?")[0]}</div><div className="min-w-0 flex-1"><p className="text-xs text-white">{message.sender?.username || "Member"} <span className="float-right text-slate-500">{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></p><p className="text-xs text-slate-400 truncate">{message.content}</p></div></button>)}
      </div>
    </div>
  );
}
