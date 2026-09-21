import React, { useState } from 'react';
import { Settings, Globe, Shield, Activity, AlertTriangle, Key } from 'lucide-react';

const AdminSettings = () => {
  // Static state for now
  const [allowSignups, setAllowSignups] = useState(true);
  const [requireEmailVer, setRequireEmailVer] = useState(false);
  const [allowGoogleLogin, setAllowGoogleLogin] = useState(true);
  const [allowGithubLogin, setAllowGithubLogin] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  const [platformName, setPlatformName] = useState("Dev Collaboration Platform");

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto w-full max-w-5xl mx-auto p-4 md:p-6 pb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="text-slate-400" size={28} /> Platform Settings
          </h1>
          <p className="text-slate-400 text-sm">Configure global application behavior and maintenance.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg cursor-pointer"
        >
          Save Changes
        </button>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl shadow-lg overflow-hidden">
          <div className="p-5 border-b border-[#ffffff]/5 flex items-center gap-2 bg-[#0f111a]/50">
            <Globe className="text-blue-400" size={18} />
            <h2 className="text-lg font-bold text-white">General Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Platform Name</label>
              <input 
                type="text" 
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full max-w-md bg-[#0f111a] border border-slate-700 text-sm rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Support Email</label>
              <input 
                type="email" 
                defaultValue="support@devplatform.com"
                className="w-full max-w-md bg-[#0f111a] border border-slate-700 text-sm rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Default Timezone</label>
              <select className="w-full max-w-md bg-[#0f111a] border border-slate-700 text-sm rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors">
                <option>UTC (Coordinated Universal Time)</option>
                <option>America/New_York (EST)</option>
                <option>America/Los_Angeles (PST)</option>
                <option>Europe/London (GMT)</option>
                <option>Asia/Kolkata (IST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* User & Registration */}
        <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl shadow-lg overflow-hidden">
          <div className="p-5 border-b border-[#ffffff]/5 flex items-center gap-2 bg-[#0f111a]/50">
            <Key className="text-purple-400" size={18} />
            <h2 className="text-lg font-bold text-white">Authentication & Registration</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0f111a] rounded-lg border border-[#ffffff]/5">
              <div>
                <h3 className="text-white font-bold text-sm">Allow Public Signups</h3>
                <p className="text-xs text-slate-400 mt-0.5">When disabled, new users can only join via invitation.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={allowSignups} onChange={() => setAllowSignups(!allowSignups)} />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#0f111a] rounded-lg border border-[#ffffff]/5">
              <div>
                <h3 className="text-white font-bold text-sm">Require Email Verification</h3>
                <p className="text-xs text-slate-400 mt-0.5">Force new accounts to verify their email before logging in.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={requireEmailVer} onChange={() => setRequireEmailVer(!requireEmailVer)} />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0f111a] rounded-lg border border-[#ffffff]/5">
              <div>
                <h3 className="text-white font-bold text-sm">Allow Google Login</h3>
                <p className="text-xs text-slate-400 mt-0.5">Enable Google OAuth2 for authentication.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={allowGoogleLogin} onChange={() => setAllowGoogleLogin(!allowGoogleLogin)} />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0f111a] rounded-lg border border-[#ffffff]/5">
              <div>
                <h3 className="text-white font-bold text-sm">Allow GitHub Login</h3>
                <p className="text-xs text-slate-400 mt-0.5">Enable GitHub OAuth2 for authentication.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={allowGithubLogin} onChange={() => setAllowGithubLogin(!allowGithubLogin)} />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl shadow-lg overflow-hidden">
          <div className="p-5 border-b border-[#ffffff]/5 flex items-center gap-2 bg-[#0f111a]/50">
            <Activity className="text-emerald-400" size={18} />
            <h2 className="text-lg font-bold text-white">System Maintenance</h2>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between p-4 bg-orange-500/5 rounded-lg border border-orange-500/10">
              <div>
                <h3 className="text-orange-400 font-bold text-sm flex items-center gap-2">
                  Maintenance Mode
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                  When enabled, all non-admin users will be logged out and presented with a maintenance screen. 
                  Use this only during critical upgrades or platform migrations.
                </p>
                {maintenanceMode && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-400 mb-1">Maintenance Message (shown to users)</label>
                    <textarea 
                      className="w-full max-w-md bg-[#0f111a] border border-orange-500/30 text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      rows={3}
                      defaultValue="We are currently performing scheduled maintenance. We'll be back online shortly."
                    ></textarea>
                  </div>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1">
                <input type="checkbox" className="sr-only peer" checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#1c1f2e] border border-red-500/20 rounded-xl shadow-lg overflow-hidden mt-8">
          <div className="p-5 border-b border-red-500/20 flex items-center gap-2 bg-red-500/5">
            <AlertTriangle className="text-red-400" size={18} />
            <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-bold text-sm">Purge Deleted Data</h3>
                <p className="text-xs text-slate-400 mt-0.5">Permanently remove all soft-deleted organizations, workspaces, and users.</p>
              </div>
              <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-bold transition-colors whitespace-nowrap">
                Purge Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
