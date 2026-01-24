import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import QRCode from 'react-qr-code';
import { Play, RotateCcw, UserPlus, FileText, AlertTriangle, Users, Clock, MapPin, Search, Loader2, GraduationCap, Activity, CheckCircle2 } from 'lucide-react';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [session, setSession] = useState(null);
    const [records, setRecords] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [manualStudentId, setManualStudentId] = useState('');
    const [overrideReason, setOverrideReason] = useState('');
    const [status, setStatus] = useState('');
    const [coords, setCoords] = useState(null);
    const [locationLoading, setLocationLoading] = useState(true);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setLocationLoading(false);
                },
                (err) => {
                    setStatus('GPS Error: Location required for session initialization.');
                    setLocationLoading(false);
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    }, []);

    // WebSocket Listener for real-time attendance tracking
    useEffect(() => {
        if (socket && session) {
            socket.on('ATTENDANCE_CONFIRMED', (data) => {
                if (data.sessionId === session.sessionId) {
                    setRecords(prev => {
                        // Avoid duplicates if manual sync happens simultaneously
                        if (prev.some(r => r.studentId?._id === data.student._id)) return prev;
                        return [{
                            studentId: data.student,
                            timestamp: data.timestamp,
                            status: 'verified',
                            method: data.method
                        }, ...prev];
                    });
                    setStatus(`Sync: ${data.student.name} marked present.`);
                    setTimeout(() => setStatus(''), 2000);
                }
            });
            return () => socket.off('ATTENDANCE_CONFIRMED');
        }
    }, [socket, session]);

    // Fetch students when a class is selected
    useEffect(() => {
        if (selectedClass) {
            const fetchStudents = async () => {
                try {
                    const { data } = await API.get(`/auth/students/${selectedClass}`);
                    setStudents(data);
                } catch (err) {
                    console.error("Failed to fetch registry");
                }
            };
            fetchStudents();
        } else {
            setStudents([]);
        }
    }, [selectedClass]);

    const startSession = async () => {
        if (!coords) return alert("System requires valid GPS lock to anchor session.");
        if (!selectedClass) return alert("Please specify the Target Class (e.g., Class A).");

        try {
            const response = await API.post('/attendance/session', {
                coords: coords,
                radius: 150,
                durationMinutes: 45,
                targetClass: selectedClass
            });
            setSession(response.data);
            setStatus(`Active Channel for ${selectedClass} Initialized.`);
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            console.error(error);
            setStatus('System Initialization Failure.');
        }
    };

    const handleOverride = async (studentId) => {
        if (!session) return alert("System requires active session for override protocols.");
        const sid = studentId || manualStudentId;
        if (!sid) return alert("Student Identity Required.");

        try {
            await API.post('/attendance/override', {
                sessionId: session.sessionId,
                studentId: sid,
                reason: overrideReason || "Teacher Manual Validation"
            });
            // We don't manually update records here because the socket listener will handle it!
            setStatus(`Override request sent for ID ${sid}`);
            setManualStudentId('');
            setOverrideReason('');
        } catch (error) {
            alert("Override rejection: Check student identity.");
        }
    };

    const fetchRecords = async () => {
        if (!session) return;
        try {
            const response = await API.get(`/attendance/records/${session.sessionId}`);
            setRecords(response.data);
            setStatus('Sync Complete');
            setTimeout(() => setStatus(''), 2000);
        } catch (error) {
            console.error(error);
            setStatus('Sync Failure');
        }
    };

    const attendanceCount = records.length;
    const totalStudents = students.length;
    const attendancePercentage = totalStudents > 0 ? Math.round((attendanceCount / totalStudents) * 100) : 0;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 animate-slide-up space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Administrative Console</p>
                    <h1 className="text-5xl font-black font-heading tracking-tighter uppercase italic text-white leading-tight">Control Center</h1>
                </div>
                <div className="flex bg-white/5 border border-white/5 p-2 rounded-2xl gap-2">
                    <div className="px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <p className="text-[8px] font-black text-indigo-300 uppercase">Supervisor</p>
                        <p className="text-xs font-bold text-white tracking-widest">{user?.name?.split(' ')[0]}</p>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            {session && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
                    <div className="glass-panel p-6 border-indigo-500/20 flex flex-col gap-1">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Live Status</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-xl font-black text-white uppercase tracking-tighter">Broadcasting</span>
                        </div>
                    </div>
                    <div className="glass-panel p-6 border-indigo-500/20 flex flex-col gap-1">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Verified Registry</p>
                        <span className="text-2xl font-black text-white">{attendanceCount} <span className="text-white/20 text-sm">/ {totalStudents}</span></span>
                    </div>
                    <div className="glass-panel p-6 border-indigo-500/20 flex flex-col gap-1">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Response Rate</p>
                        <span className="text-2xl font-black text-indigo-400">{attendancePercentage}%</span>
                    </div>
                    <div className="glass-panel p-6 border-indigo-500/20 flex flex-col gap-1">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Target Group</p>
                        <span className="text-xl font-black text-white uppercase tracking-tighter">{session.targetClass}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-panel p-10 bg-gradient-to-br from-indigo-500/5 to-transparent">
                        <h2 className="text-sm font-black mb-8 flex items-center gap-3 text-indigo-400 uppercase tracking-widest">
                            <Clock size={18} /> Active Channel
                        </h2>

                        {!session ? (
                            <div className="text-center py-10 space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block text-left ml-2">Broadcast Target (Class)</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                                        <input
                                            type="text"
                                            className="input-premium pl-12 border-white/5 bg-white/[0.05]"
                                            placeholder="e.g. Class A"
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="p-8 rounded-full bg-white/5 border border-white/5 w-fit mx-auto flex items-center justify-center">
                                    {locationLoading ? <Loader2 className="animate-spin text-white/20" size={48} /> : <Play size={48} className={`translate-x-1 ${coords ? 'text-indigo-400' : 'text-white/10'}`} />}
                                </div>

                                <div className="space-y-4">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${coords ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                        <MapPin size={12} /> {coords ? 'GPS Lock Fixed' : 'Acquiring GPS Signal...'}
                                    </div>
                                    <button
                                        onClick={startSession}
                                        disabled={!coords || !selectedClass}
                                        className={`btn-premium w-full py-5 text-sm uppercase font-black tracking-widest flex items-center justify-center gap-2 ${(!coords || !selectedClass) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                    >
                                        <Play size={18} /> Send Notifications
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-slide-up">
                                <div className="bg-white p-6 rounded-[2.5rem] flex justify-center shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)] group overflow-hidden">
                                    <QRCode value={session.joinCode} size={200} viewBox={`0 0 256 256`} />
                                </div>
                                <div className="text-center space-y-4">
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">{session.targetClass} Join Code</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <p className="text-5xl font-heading font-black text-white tracking-[0.2em]">{session.joinCode}</p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(session.joinCode);
                                                setStatus('Code copied to clipboard');
                                                setTimeout(() => setStatus(''), 2000);
                                            }}
                                            className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 transition-all shadow-lg"
                                        >
                                            <FileText size={20} />
                                        </button>
                                    </div>
                                </div>
                                <button className="w-full py-4 rounded-2xl bg-red-500/5 text-red-400 border border-red-500/10 text-[10px] uppercase font-black tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2" onClick={() => setSession(null)}>
                                    <RotateCcw size={14} /> Kill Protocol
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="glass-panel p-10 bg-gradient-to-tr from-amber-500/[0.02] to-transparent flex flex-col h-[600px]">
                        <h2 className="text-sm font-black mb-8 flex items-center justify-between text-amber-400 uppercase tracking-widest">
                            <span className="flex items-center gap-3"><Users size={18} /> Student Registry</span>
                            <span className="text-[10px] text-white/20">{totalStudents} Enrolled</span>
                        </h2>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-premium">
                            {students.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-3xl">
                                    <Search className="text-white/10 mb-4" size={32} />
                                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Enter class name to see <br /> registry</p>
                                </div>
                            ) : (
                                students.map((student) => {
                                    const isAttended = records.some(r => r.studentId?._id === student._id);
                                    return (
                                        <div key={student._id} className={`p-4 rounded-2xl border transition-all flex justify-between items-center ${isAttended ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-white">{student.name}</p>
                                                <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Roll: {student.rollNo}</p>
                                            </div>
                                            {!isAttended && session && (
                                                <button
                                                    onClick={() => handleOverride(student._id)}
                                                    className="p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                                                    title="Manual Override"
                                                >
                                                    <UserPlus size={14} />
                                                </button>
                                            )}
                                            {isAttended && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/20 animate-slide-up">
                                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                                    <span className="text-[9px] font-black text-emerald-300 uppercase tracking-tighter">Verified</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="glass-panel p-10 flex flex-col h-[600px] bg-gradient-to-bl from-emerald-500/[0.02] to-transparent">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-sm font-black flex items-center gap-3 text-emerald-400 uppercase tracking-widest">
                                <Activity size={18} /> Live Feed
                            </h2>
                            <button onClick={fetchRecords} className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
                                <RotateCcw size={14} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-premium">
                            {records.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center mb-4 animate-pulse">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    </div>
                                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Waiting for incoming <br /> biometric signals...</p>
                                </div>
                            ) : (
                                records.map((rec, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex justify-between items-center animate-slide-up hover:bg-indigo-500/10 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-white">{rec.studentId?.name}</p>
                                            <p className="text-[9px] text-white/40 tracking-wider uppercase font-bold">Roll: {rec.studentId?.rollNo} • {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                        </div>
                                        <div className={`badge-premium px-3 ${rec.method === 'override' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20 italic' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'}`}>
                                            {rec.status}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {status && (
                <div className="fixed bottom-12 right-12 px-8 py-4 glass-panel border-indigo-500/40 text-indigo-200 text-xs font-black tracking-[0.3em] uppercase animate-slide-up shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-indigo-400" />
                    {status}
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
