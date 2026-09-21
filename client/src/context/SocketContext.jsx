import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext({ socket: null, connected: false });

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [authVersion, setAuthVersion] = useState(0);
  useEffect(() => {
    const refresh = () => setAuthVersion((version) => version + 1);
    window.addEventListener("auth:changed", refresh);
    return () => window.removeEventListener("auth:changed", refresh);
  }, []);
  useEffect(() => {
    if (!localStorage.getItem("user")) return undefined;
    const connection = io(import.meta.env.VITE_API_URL || "http://localhost:5000", { withCredentials: true, transports: ["websocket", "polling"] });
    const onConnect = () => { setConnected(true); setConnectionError(""); };
    const onDisconnect = () => setConnected(false);
    const onError = (error) => setConnectionError(error.message || "Live chat is unavailable.");
    connection.on("connect", onConnect); connection.on("disconnect", onDisconnect); connection.on("connect_error", onError); setSocket(connection);
    return () => { connection.off("connect", onConnect); connection.off("disconnect", onDisconnect); connection.off("connect_error", onError); connection.disconnect(); setSocket(null); };
  }, [authVersion]);
  const value = useMemo(() => ({ socket, connected, connectionError, disconnect: () => socket?.disconnect() }), [socket, connected, connectionError]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
