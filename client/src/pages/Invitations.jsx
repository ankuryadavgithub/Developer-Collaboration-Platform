import React, { useState, useEffect } from "react";
import { Mail, Inbox, AlertCircle } from "lucide-react";
import InvitationCard from "../components/InvitationCard";
import {
  getPendingInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../services/invitationService";
import { useOrganization } from "../context/OrganizationContext";
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // We bring this in so we can refresh the user's organizations after they accept an invite
  const { fetchOrganizations } = useOrganization();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingInvitations();
      // Assuming your backend returns { success: true, data: [...] }
      setInvitations(data.data || data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load invitations. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      setProcessingId(id);
      await acceptInvitation(id);

      // Remove from list
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));

      // Refresh context so the new organization appears in the UI instantly
      await fetchOrganizations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept invitation.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await rejectInvitation(id);

      // Remove from list
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject invitation.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} />
        <main className="flex-1 p-4 md:p-8 w-full h-full overflow-y-auto min-w-0">
          <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 font-medium">Loading invitations...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} />
      <main className="flex-1 p-4 md:p-8 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full mt-4">
          <div className="mb-8 flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Mail size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Pending Invitations</h1>
              <p className="text-slate-400 mt-1">Review and manage your invitations to join organizations.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 text-red-400">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {invitations.length === 0 ? (
            <div className="text-center py-16 bg-[#1c1f2e] rounded-2xl border border-dashed border-[#ffffff]/20 shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Inbox size={32} />
              </div>
              <h3 className="text-lg font-semibold text-white">No pending invitations</h3>
              <p className="text-slate-400 mt-2 max-w-sm text-sm">
                When you are invited to join an organization, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isProcessing={processingId === invitation.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Invitations;
