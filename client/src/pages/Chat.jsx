import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Hash, MessageCircle, Plus, Send, Users, X } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { useSocket } from "../context/SocketContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const time = (value) => new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const memberUser = (member) => member.user || member;

export default function ChatPage() {
  const { orgId, workspaceId } = useParams();
  const { socket, connected } = useSocket();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [channels, setChannels] = useState([]);
  const [directs, setDirects] = useState([]);
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: "", description: "", memberIds: [] });
  const messagesRef = useRef(null);
  const base = `${API}/api/organizations/${orgId}/workspaces/${workspaceId}/chat`;

  const otherUser = (conversation) => conversation?.participants?.find((participant) => participant.userId !== currentUser?.id)?.user;
  const selectedTitle = selected?.type === "channel" ? `#${selected.entity.name}` : otherUser(selected?.entity)?.username || "Direct message";
  const selectedDescription = selected?.type === "channel" ? selected.entity.description || "Channel discussion" : "One-to-one conversation";

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      axios.get(`${base}/channels`, { withCredentials: true }),
      axios.get(`${base}/direct`, { withCredentials: true }),
      axios.get(`${API}/api/organizations/${orgId}/workspaces/${workspaceId}/members`, { withCredentials: true }),
    ]).then(([channelRes, directRes, memberRes]) => {
      if (!active) return;
      const loadedChannels = channelRes.data.data || [];
      const loadedMembers = memberRes.data.data || [];
      setChannels(loadedChannels);
      setDirects(directRes.data.data || []);
      setMembers(loadedMembers);
      setNewChannel((value) => ({ ...value, memberIds: loadedMembers.map((member) => memberUser(member).id) }));
      const general = loadedChannels.find((item) => item.name === "general") || loadedChannels[0];
      if (general) setSelected({ type: "channel", entity: general });
    }).catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load chat."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [API, base, orgId, workspaceId]);

  useEffect(() => {
    if (!selected) return undefined;
    let active = true;
    setLoading(true);
    setMessages([]);
    const path = selected.type === "channel"
      ? `${base}/channels/${selected.entity.id}/messages`
      : `${base}/direct/${selected.entity.id}/messages`;
    axios.get(path, { params: { page: 1, limit: 100 }, withCredentials: true })
      .then((res) => active && setMessages(res.data.data || []))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load messages."))
      .finally(() => active && setLoading(false));
    const event = selected.type === "channel" ? "channel:join" : "direct:join";
    socket?.emit(event, { workspaceId: Number(workspaceId), [selected.type === "channel" ? "channelId" : "conversationId"]: selected.entity.id });
    return () => {
      active = false;
      socket?.emit(selected.type === "channel" ? "channel:leave" : "direct:leave", { [selected.type === "channel" ? "channelId" : "conversationId"]: selected.entity.id });
    };
  }, [base, selected, socket, workspaceId]);

  useEffect(() => {
    if (!socket || !selected) return undefined;
    const add = (message) => {
      const matching = selected.type === "channel" ? message.channelId === selected.entity.id : message.conversationId === selected.entity.id;
      if (matching) setMessages((items) => items.some((item) => item.id === message.id) ? items : [...items, message]);
    };
    socket.on(selected.type === "channel" ? "message:new" : "direct:message:new", add);
    return () => socket.off(selected.type === "channel" ? "message:new" : "direct:message:new", add);
  }, [selected, socket]);

  useEffect(() => { messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const addMessage = (message) => setMessages((items) => items.some((item) => item.id === message.id) ? items : [...items, message]);
  const send = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !selected) return;
    setDraft(""); setError("");
    const messageKey = selected.type === "channel" ? "channelId" : "conversationId";
    const socketEvent = selected.type === "channel" ? "message:send" : "direct:message:send";
    const endpoint = selected.type === "channel" ? `${base}/channels/${selected.entity.id}/messages` : `${base}/direct/${selected.entity.id}/messages`;
    if (connected && socket) {
      socket.emit(socketEvent, { workspaceId: Number(workspaceId), [messageKey]: selected.entity.id, content }, (result) => {
        if (result?.ok) addMessage(result.message);
        else { setDraft(content); setError(result?.message || "Message failed to send."); }
      });
      return;
    }
    try { const result = await axios.post(endpoint, { content }, { withCredentials: true }); addMessage(result.data.data); }
    catch (requestError) { setDraft(content); setError(requestError.response?.data?.message || "Message failed to send."); }
  };

  const createChannel = async (event) => {
    event.preventDefault();
    try {
      const result = await axios.post(`${base}/channels`, newChannel, { withCredentials: true });
      setChannels((items) => [...items, result.data.data].sort((a, b) => a.name.localeCompare(b.name)));
      setSelected({ type: "channel", entity: result.data.data });
      setShowCreate(false); setNewChannel({ name: "", description: "", memberIds: members.map((member) => memberUser(member).id) });
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to create channel."); }
  };

  const startDirect = async (userId) => {
    if (userId === currentUser?.id) return;
    try {
      const result = await axios.post(`${base}/direct/${userId}`, {}, { withCredentials: true });
      const conversation = result.data.data;
      setDirects((items) => [conversation, ...items.filter((item) => item.id !== conversation.id)]);
      setSelected({ type: "direct", entity: conversation });
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to start a direct conversation."); }
  };

  const channelMembers = useMemo(() => selected?.type === "channel" ? members.filter((member) => selected.entity.members?.some((item) => item.userId === memberUser(member).id)) : [], [members, selected]);
  const toggleMember = (userId) => setNewChannel((value) => ({ ...value, memberIds: value.memberIds.includes(userId) ? value.memberIds.filter((id) => id !== userId) : [...value.memberIds, userId] }));

  return <div className="flex min-h-screen bg-[#0b0d14] text-slate-100"><Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} /><div className="flex min-w-0 flex-1 flex-col"><Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} /><main className="flex-1 p-4 md:p-6"><div className="mb-5 flex items-center gap-3"><MessageCircle className="text-violet-500" size={34} /><div><h1 className="text-2xl font-bold">Chat</h1><p className="text-sm text-slate-400">Collaborate in channels or speak one-to-one with a teammate.</p></div></div>{error && <p className="mb-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}<div className="grid min-h-[690px] grid-cols-1 gap-3 xl:grid-cols-[300px_minmax(0,1fr)_280px]"><aside className="rounded-xl border border-white/10 bg-[#111827] p-4"><div className="mb-4"><p className="font-semibold">Workspace channels</p><p className="text-xs text-slate-400">{members.length} members · {channels.length} channels</p></div><button onClick={() => setShowCreate(true)} className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-semibold"><Plus size={15} /> Create channel</button><p className="mb-2 text-xs font-bold tracking-wider text-slate-500">CHANNELS</p>{channels.map((item) => <button key={item.id} onClick={() => setSelected({ type: "channel", entity: item })} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${selected?.type === "channel" && selected.entity.id === item.id ? "bg-indigo-500/20 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Hash size={16} />{item.name}</button>)}<p className="mb-2 mt-6 text-xs font-bold tracking-wider text-slate-500">DIRECT MESSAGES</p>{directs.map((conversation) => { const user = otherUser(conversation); return <button key={conversation.id} onClick={() => setSelected({ type: "direct", entity: conversation })} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${selected?.type === "direct" && selected.entity.id === conversation.id ? "bg-indigo-500/20 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><MessageCircle size={15} />{user?.username || "Member"}</button>; })}</aside><section className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-[#111827]"><header className="flex items-center justify-between border-b border-white/10 p-5"><div><h2 className="flex items-center gap-2 text-lg font-semibold">{selected?.type === "channel" ? <Hash className="text-violet-400" /> : <MessageCircle className="text-violet-400" />}{selectedTitle || "Chat"}</h2><p className="text-xs text-slate-400">{selectedDescription}</p></div><span className={`text-xs ${connected ? "text-emerald-400" : "text-amber-400"}`}>{connected ? "● Live" : "● Secure fallback"}</span></header><div ref={messagesRef} className="flex-1 space-y-5 overflow-y-auto p-5">{loading ? <p className="pt-20 text-center text-sm text-slate-500">Loading messages...</p> : messages.length === 0 ? <p className="pt-20 text-center text-sm text-slate-500">No messages yet. Start the conversation.</p> : messages.map((message) => <article key={message.id} className="flex gap-3"><div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-indigo-600 text-center leading-10">{message.sender?.avatar ? <img src={message.sender.avatar} alt="" className="h-full w-full object-cover" /> : (message.sender?.username || "?")[0]}</div><div><p className="text-sm font-semibold">{message.senderId === currentUser?.id ? "You" : message.sender?.username || "Member"} <span className="ml-2 text-xs font-normal text-slate-500">{time(message.createdAt)}</span></p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{message.content}</p></div></article>)}</div><form onSubmit={send} className="border-t border-white/10 p-4"><div className="flex gap-2 rounded-lg border border-white/10 bg-[#1c2333] p-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} disabled={!selected} placeholder={selected?.type === "channel" ? `Write a message in ${selectedTitle}...` : `Message ${selectedTitle}...`} maxLength={4000} className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none disabled:opacity-50" /><button disabled={!draft.trim() || !selected} className="rounded-md bg-indigo-600 p-2 disabled:opacity-50"><Send size={18} /></button></div><p className="mt-2 text-right text-[11px] text-slate-500">Press Enter to send</p></form></section><aside className="rounded-xl border border-white/10 bg-[#111827] p-4"><h3 className="mb-4 font-semibold">{selected?.type === "channel" ? "Channel info" : "People"}</h3>{selected?.type === "channel" && <><div className="mb-5 flex items-center gap-3"><div className="rounded-full bg-violet-600/30 p-3"><Hash /></div><div><p className="font-semibold">{selected.entity.name}</p><p className="text-xs text-slate-400">{selected.entity._count?.members || 0} selected members</p></div></div><h3 className="mb-3 flex items-center gap-2 font-semibold"><Users size={16} /> Workspace members</h3></>}{selected?.type === "direct" && <p className="mb-3 text-sm text-slate-400">Choose another member to start a conversation.</p>}<div className="space-y-2">{(selected?.type === "channel" ? channelMembers : members).map((member) => { const user = memberUser(member); return <div key={user.id} className="flex items-center gap-2 rounded-lg p-1"><div className="h-7 w-7 overflow-hidden rounded-full bg-slate-700">{user.avatar && <img src={user.avatar} alt="" className="h-full w-full object-cover" />}</div><span className="min-w-0 flex-1 truncate text-sm">{user.id === currentUser?.id ? `${user.username || "You"} (You)` : user.username || "Member"}</span>{user.id !== currentUser?.id && <button onClick={() => startDirect(user.id)} className="rounded px-2 py-1 text-xs text-indigo-300 hover:bg-white/10">Message</button>}</div>; })}</div></aside></div></main></div>{showCreate && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><form onSubmit={createChannel} className="w-full max-w-md rounded-xl border border-white/10 bg-[#111827] p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Create channel</h2><p className="text-xs text-slate-400">Everyone is selected by default; deselect members for a private channel.</p></div><button type="button" onClick={() => setShowCreate(false)}><X size={18} /></button></div><input required value={newChannel.name} onChange={(event) => setNewChannel((value) => ({ ...value, name: event.target.value }))} placeholder="Channel name" className="mb-3 w-full rounded-lg border border-white/10 bg-[#1c2333] px-3 py-2 text-sm outline-none" /><input value={newChannel.description} onChange={(event) => setNewChannel((value) => ({ ...value, description: event.target.value }))} placeholder="Description (optional)" className="mb-3 w-full rounded-lg border border-white/10 bg-[#1c2333] px-3 py-2 text-sm outline-none" /><div className="mb-4 max-h-56 space-y-2 overflow-y-auto rounded-lg border border-white/10 p-3">{members.map((member) => { const user = memberUser(member); return <label key={user.id} className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={newChannel.memberIds.includes(user.id)} onChange={() => toggleMember(user.id)} /><span>{user.username || "Member"}{user.id === currentUser?.id ? " (You)" : ""}</span></label>; })}</div><button className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold">Create channel</button></form></div>}</div>;
}
