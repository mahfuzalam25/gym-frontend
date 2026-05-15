"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// --- INTERFACES ---
interface StatsData {
  total_machines: number;
  total_scans: number;
  total_clicks: number;
  recent_activity: { id: number; machine_name: string; scanned_at: string; ip_address: string }[];
}

interface MachineListItem {
  id: string;
  name: string;
  created_at: string;
  total_scans: number;
  total_clicks: number;
}

// --- ICONS ---
const ChartIcon = () => <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const QrIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>;
const DownloadIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EditIcon = () => <svg className="w-5 h-5 text-blue-500 hover:text-blue-700 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

export default function AdminDashboard() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  // --- AUTH STATE ---
  const [token, setToken] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- DASHBOARD STATE ---
  const [stats, setStats] = useState<StatsData | null>(null);
  const [machines, setMachines] = useState<MachineListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  // Modals & Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<{ name: string; base64: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    video_url: "",
    how_to_use: "",
    common_mistakes: "",
    muscles_worked: "",
    pt_booking_url: "",
    class_join_url: ""
  });
  
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null); // NEW: Video File State

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setFormData({ name: "", video_url: "", how_to_use: "", common_mistakes: "", muscles_worked: "", pt_booking_url: "", class_join_url: "" });
    setImage1(null);
    setImage2(null);
    setVideoFile(null);
    setEditingId(null);
    setIsFormOpen(false);
  }

  // --- AUTHENTICATION LOGIC ---
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("admin_token");
      if (savedToken) {
        setToken(savedToken);
      }
      setAuthChecking(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch(`${API_BASE}/api/machines/admin/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        localStorage.setItem("admin_token", data.token);
        setRefreshTrigger(prev => prev + 1); // Trigger data fetch
      } else {
        setLoginError("Invalid admin credentials");
      }
    } catch (error) {
      setLoginError("Network error. Make sure the backend is running.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("admin_token");
    setStats(null);
    setMachines([]);
  };

  // --- DATA FETCHING (Protected) ---
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const headers = { "Authorization": `Token ${token}` };
        const [statsRes, listRes] = await Promise.all([
          fetch(`${API_BASE}/api/machines/admin/stats/`, { headers }),
          fetch(`${API_BASE}/api/machines/admin/list/`, { headers })
        ]);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (listRes.ok) setMachines(await listRes.json());
        
        // Handle invalid token
        if (statsRes.status === 401 || listRes.status === 401) {
          handleLogout();
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshTrigger, token, API_BASE]);

  // --- CRUD OPERATIONS (Protected) ---
  const handleEditClick = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/machines/${id}/`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || "",
          video_url: data.video_url || "",
          how_to_use: data.how_to_use || "",
          common_mistakes: data.common_mistakes || "",
          muscles_worked: data.muscles_worked || "",
          pt_booking_url: data.pt_booking_url || "",
          class_join_url: data.class_join_url || ""
        });
        setEditingId(id);
        setIsFormOpen(true);
      } else {
        showToast("Failed to fetch machine details", "error");
      }
    } catch (error) {
      console.error("Failed to load machine for editing", error);
      showToast("Network error while loading machine", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/machines/admin/manage/${id}/`, {
        method: 'DELETE',
        headers: { "Authorization": `Token ${token}` }
      });
      if (res.ok) {
        showToast("Machine deleted successfully", "success");
        setRefreshTrigger(prev => prev + 1);
      } else {
        showToast("Failed to delete machine", "error");
      }
    } catch (error) {
      console.error("Delete failed", error);
      showToast("A network error occurred", "error");
    }
  };

  const handleSaveMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append("name", formData.name);
    
    if (formData.video_url) submitData.append("video_url", formData.video_url);
    if (formData.how_to_use) submitData.append("how_to_use", formData.how_to_use);
    if (formData.common_mistakes) submitData.append("common_mistakes", formData.common_mistakes);
    if (formData.muscles_worked) submitData.append("muscles_worked", formData.muscles_worked);
    if (formData.pt_booking_url) submitData.append("pt_booking_url", formData.pt_booking_url);
    if (formData.class_join_url) submitData.append("class_join_url", formData.class_join_url);
    
    if (image1) submitData.append("exercise_image_1", image1);
    if (image2) submitData.append("exercise_image_2", image2);
    if (videoFile) submitData.append("video_file", videoFile);

    const url = editingId 
      ? `${API_BASE}/api/machines/admin/manage/${editingId}/` 
      : `${API_BASE}/api/machines/admin/manage/`;
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Authorization": `Token ${token}` }, // Note: Let the browser set Content-Type for FormData
        body: submitData
      });
      
      if (res.ok) {
        showToast(editingId ? "Machine updated successfully!" : "Machine saved successfully!", "success");
        resetForm();
        setRefreshTrigger(prev => prev + 1);
      } else {
        const errorData = await res.json();
        const firstErrorKey = Object.keys(errorData)[0];
        const firstErrorMessage = errorData[firstErrorKey][0];
        showToast(`${firstErrorKey}: ${firstErrorMessage}`, "error");
      }
    } catch (error) {
      console.error("Save failed", error);
      showToast("A network error occurred while saving.", "error");
    }
  };

  // --- QR CODE OPERATIONS (Protected) ---
  const handlePreviewQR = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/machines/admin/qr/${id}/`, {
        headers: { "Authorization": `Token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQrPreview({ name: data.machine_name, base64: data.qr_code_base64 });
      }
    } catch (error) {
      console.error("QR Preview failed", error);
    }
  };

  const handleExportZIP = async () => {
    try {
      // Must fetch as blob because we need to pass the Auth Token
      const res = await fetch(`${API_BASE}/api/machines/admin/qr/export/`, {
        headers: { "Authorization": `Token ${token}` }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "gym_qr_codes.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        showToast("Failed to export ZIP file.", "error");
      }
    } catch (error) {
      console.error("Export failed", error);
      showToast("Network error while exporting.", "error");
    }
  };

  // --- RENDER LOGIC ---

  if (authChecking) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  // LOGIN SCREEN
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-center mb-8">
            <Image src="/gymmvplogo.png" alt="Gym Admin Logo" width={140} height={50} className="object-contain" />
          </div>
          <h1 className="text-2xl font-black text-center text-gray-900 mb-6">Admin Login</h1>
          {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-semibold text-center border border-red-100">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input required type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input required type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors disabled:opacity-70">
              {isLoggingIn ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD (If loading initial data)
  if (loading && machines.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-12 relative">
      
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center">
            <Image src="/gymmvplogo.png" alt="Gym Admin Logo" width={100} height={40} className="object-contain" />
          </div>
          <div className="flex gap-3 md:gap-4 items-center">
            <button onClick={handleExportZIP} className="hidden sm:flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg text-sm transition-colors border border-gray-300">
              <DownloadIcon /> Export ZIP
            </button>
            <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-sm transition-colors">
              <PlusIcon /> Add
            </button>
            <button onClick={handleLogout} className="flex items-center text-gray-500 hover:text-red-600 font-semibold py-2 px-2 text-sm transition-colors ml-2" title="Logout">
              <LogoutIcon />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Main Dashboard */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* STATS OVERVIEW */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg"><ChartIcon /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Machines</p>
                <p className="text-3xl font-extrabold">{stats?.total_machines || 0}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-lg"><ChartIcon /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Scans</p>
                <p className="text-3xl font-extrabold">{stats?.total_scans || 0}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-amber-50 p-3 rounded-lg"><ChartIcon /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Button Clicks</p>
                <p className="text-3xl font-extrabold">{stats?.total_clicks || 0}</p>
              </div>
            </div>
          </section>

          {/* MACHINE LIST TABLE */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Machine Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Machine Name</th>
                    <th className="px-6 py-4 font-semibold text-center">Scans</th>
                    <th className="px-6 py-4 font-semibold text-center">Clicks</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {machines.map((machine) => (
                    <tr key={machine.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{machine.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-xs font-bold">{machine.total_scans}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-amber-50 text-amber-700 py-1 px-3 rounded-full text-xs font-bold">{machine.total_clicks}</span>
                      </td>
                      <td className="px-6 py-4 flex justify-end gap-5 items-center">
                        <button onClick={() => handlePreviewQR(machine.id)} className="text-gray-500 hover:text-blue-600 transition-colors" title="Preview QR">
                          <QrIcon />
                        </button>
                        <button onClick={() => handleEditClick(machine.id)} title="Edit Machine">
                          <EditIcon />
                        </button>
                        <button onClick={() => handleDelete(machine.id, machine.name)} title="Delete Machine">
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {machines.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No machines added yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* RECENT ACTIVITY FEED */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Recent Scans</h2>
            <div className="space-y-4">
              {stats?.recent_activity?.length ? stats.recent_activity.map((scan) => (
                <div key={scan.id} className="flex flex-col border-l-2 border-blue-500 pl-4 py-1">
                  <span className="font-semibold text-sm text-gray-900">{scan.machine_name}</span>
                  <span className="text-xs text-gray-500">{new Date(scan.scanned_at).toLocaleString()} • {scan.ip_address || "Unknown IP"}</span>
                </div>
              )) : (
                <p className="text-sm text-gray-500">No recent activity.</p>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* --- CUSTOM TOAST NOTIFICATION --- */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 transform transition-all duration-300 ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* --- MODALS --- */}
      {/* Add / Edit Machine Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold">{editingId ? "Edit Machine" : "Add New Machine"}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-900 text-xl font-bold">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="add-machine-form" onSubmit={handleSaveMachine} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Machine Name *</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Chest Press" />
                </div>

                {/* --- NEW VIDEO SECTION --- */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 space-y-4">
                  <h3 className="text-sm font-bold text-indigo-900">Media & Video Instruction</h3>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-800 mb-1">Video Link (YouTube / Vimeo / URL)</label>
                    <input type="url" value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} className="w-full border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="https://youtube.com/watch?v=..." />
                    
                  </div>
                  <div className="border-t border-indigo-200 pt-3">
                    <label className="block text-xs font-semibold text-indigo-800 mb-1">Or Upload Raw Video (.mp4)</label>
                    <input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-indigo-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-800 hover:file:bg-indigo-200 cursor-pointer" />
                    {editingId && <p className="text-[10px] text-indigo-500 mt-1">Leave blank to keep existing video file.</p>}
                  </div>
                </div>
                {/* ----------------------- */}
                
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Start Position Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setImage1(e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                    {editingId && <p className="text-xs text-gray-400 mt-1">Leave blank to keep existing image</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">End Position Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setImage2(e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                    {editingId && <p className="text-xs text-gray-400 mt-1">Leave blank to keep existing image</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">How to Use (Instructions)</label>
                  <textarea value={formData.how_to_use} onChange={(e) => setFormData({...formData, how_to_use: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm h-24 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Enter instructions..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Common Mistakes</label>
                  <input type="text" value={formData.common_mistakes} onChange={(e) => setFormData({...formData, common_mistakes: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Arching the back" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Target Muscles</label>
                  <input type="text" value={formData.muscles_worked} onChange={(e) => setFormData({...formData, muscles_worked: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Pectorals, Triceps" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">PT Booking URL</label>
                    <input type="url" value={formData.pt_booking_url} onChange={(e) => setFormData({...formData, pt_booking_url: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Class Join URL</label>
                    <input type="url" value={formData.class_join_url} onChange={(e) => setFormData({...formData, class_join_url: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="https://..." />
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={resetForm} className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" form="add-machine-form" className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                {editingId ? "Update Machine" : "Save Machine"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Preview Modal */}
      {qrPreview && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center relative">
            <button onClick={() => setQrPreview(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-xl font-bold">&times;</button>
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">{qrPreview.name}</h2>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 inline-block mb-6">
              <img src={qrPreview.base64} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <a 
              href={qrPreview.base64} 
              download={`QR_${qrPreview.name.replace(/ /g, '_')}.png`}
              className="block w-full bg-[#535353] hover:bg-gray-800 text-white font-bold py-3 rounded-lg text-sm uppercase tracking-wider transition-colors"
            >
              Download PNG
            </a>
          </div>
        </div>
      )}
    </div>
  );
}