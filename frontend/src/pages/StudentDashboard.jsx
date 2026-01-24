import React, { useState, useEffect } from 'react';
import FaceCapture from '../components/FaceCapture';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, QrCode, ClipboardCheck, Loader2, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [coords, setCoords] = useState(null);
    const [joinCode, setJoinCode] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('code') || '';
    });
    const [faceImage, setFaceImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => setStatus('Environment Error: GPS signal blocked.'),
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    }, []);

    const handleMarkAttendance = async () => {
        if (!coords) return alert("Security system requires valid coordinates.");
        if (!faceImage) return alert("Biometric identity capture required.");
        if (!joinCode || joinCode.length !== 6) return alert("Valid 6-Digit Join Code required.");

        setLoading(true);
        setStatus('Syncing Biometrics...');

        try {
            const formData = new FormData();
            formData.append('joinCode', joinCode);
            formData.append('studentCoords', JSON.stringify(coords));

            const res = await fetch(faceImage);
            const blob = await res.blob();
            formData.append('faceImage', blob, 'face.jpg');

            const { data } = await API.post('/attendance/mark', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsSuccess(true);
            setStatus('ACCESS GRANTED: ' + data.message);

            toast.success('Attendance Marked Successfully!', {
                duration: 4000,
                icon: '✅',
                style: {
                    borderRadius: '20px',
                    background: '#1e1e2e',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    letterSpacing: '0.1em'
                },
            });

            // Redirect/Reset after delay
            setTimeout(() => {
                setIsSuccess(false);
                setStatus('');
                setJoinCode('');
                setFaceImage(null);
                window.history.replaceState({}, document.title, "/student"); // Clear URL params
            }, 5000);

        } catch (error) {
            setStatus('PROTOCOL REJECTED: ' + (error.response?.data?.error || error.message));
            toast.error('Verification Failed');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto py-20 animate-slide-up flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-32 h-32 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={64} className="text-emerald-400" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-black font-heading text-white tracking-tighter uppercase italic">Mission Accomplished</h2>
                    <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                        <Sparkles size={14} /> Biometrics Verified
                    </p>
                </div>
                <div className="glass-panel p-8 w-full max-w-sm border-emerald-500/10">
                    <div className="space-y-4 text-left">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Time</span>
                            <span className="text-xs font-bold text-white uppercase">{new Date().toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Identity</span>
                            <span className="text-xs font-bold text-white uppercase">{user?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Session</span>
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">#{joinCode}</span>
                        </div>
                    </div>
                </div>
                <p className="text-[9px] text-white/20 uppercase tracking-[0.5em] animate-pulse">Automatically returning in 5 seconds...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 animate-slide-up">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-black mb-4 font-heading tracking-tighter uppercase italic text-white leading-tight">Identity Verification</h1>
                <p className="text-white/40 font-bold tracking-[0.4em] text-[10px] uppercase">Secure Student Protocol V3.0</p>
            </div>

            <div className="glass-panel p-1 border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                <div className="p-8 sm:p-12 space-y-8 bg-transparent">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">6-Digit Join Code</label>
                            <div className="relative">
                                <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                                <input
                                    type="text"
                                    maxLength={6}
                                    className="input-premium pl-12 border-white/5 bg-white/[0.02] text-xl tracking-[0.5em] font-mono"
                                    placeholder="000000"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Geo-Lock Status</label>
                            <div className={`h-[54px] rounded-2xl flex items-center px-5 border transition-all ${coords ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                                <div className="flex items-center gap-3 w-full">
                                    <MapPin size={18} className={coords ? 'text-emerald-400' : 'text-amber-500'} />
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${coords ? 'text-emerald-300' : 'text-amber-300'}`}>
                                        {coords ? 'Signal Locked' : 'Acquiring...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block text-center">Biometric Identity Relay</label>
                        <div className="p-4 rounded-3xl bg-black/40 border border-white/5 shadow-inner overflow-hidden">
                            <FaceCapture onCapture={setFaceImage} />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleMarkAttendance}
                            disabled={loading}
                            className="btn-premium w-full py-5 text-base uppercase tracking-[0.3em] font-black group flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <ClipboardCheck size={20} className="transition-transform group-hover:scale-110" />}
                            {loading ? 'Processing...' : 'Confirm Attendance'}
                        </button>
                    </div>

                    {status && !isSuccess && (
                        <div className={`p-5 rounded-2xl border text-center text-xs font-bold font-mono tracking-widest uppercase flex items-center justify-center gap-3 animate-slide-up ${status.includes('GRANTED') ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-red-300 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}`}>
                            {status.includes('GRANTED') ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
