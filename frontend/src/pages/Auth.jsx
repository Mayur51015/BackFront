import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Briefcase, ChevronRight } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('student');
    const [rollNo, setRollNo] = useState('');
    const [className, setClassName] = useState('');
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    const { user, login, register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.role === 'teacher' ? '/teacher' : '/student');
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const userData = await login(email, password);
                navigate(userData.role === 'teacher' ? '/teacher' : '/student');
            } else {
                const userData = await register({ email, password, name, role, rollNo, className });
                navigate(userData.role === 'teacher' ? '/teacher' : '/student');
            }

        } catch (err) {
            console.error("Auth Protocol Error:", err);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4 animate-slide-up">
            <div className="glass-panel p-10 md:p-16 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary opacity-10 blur-[100px] rounded-full transition-all group-hover:opacity-20"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary opacity-10 blur-[100px] rounded-full transition-all group-hover:opacity-20"></div>

                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black mb-3 font-heading uppercase tracking-tighter text-white">
                        {isLogin ? 'Identity Portal' : 'Register Service'}
                    </h2>
                    <p className="text-white/40 font-medium text-sm uppercase tracking-[0.3em]">
                        {isLogin ? 'Access Restricted Area' : 'Initialize Bio-Identity'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Assigned Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="input-premium pl-14"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {role === 'student' && (
                                <div className="grid grid-cols-2 gap-4 animate-slide-up">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Roll No.</label>
                                        <input
                                            type="text"
                                            required
                                            className="input-premium"
                                            placeholder="e.g. 101"
                                            value={rollNo}
                                            onChange={(e) => setRollNo(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Class/Section</label>
                                        <input
                                            type="text"
                                            required
                                            className="input-premium"
                                            placeholder="e.g. Class A"
                                            value={className}
                                            onChange={(e) => setClassName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}


                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">E-Mail Identity</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input
                                type="email"
                                required
                                className="input-premium pl-14"
                                placeholder="name@college.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Secure Passkey</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input
                                type="password"
                                required
                                className="input-premium pl-14"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Authorization Level</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('student')}
                                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${role === 'student' ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] scale-105' : 'bg-white/5 border-white/5 opacity-50 hover:opacity-100'}`}
                                >
                                    <UserIcon size={24} className={role === 'student' ? 'text-indigo-400' : ''} />
                                    <span className="text-[10px] uppercase font-black tracking-tighter">Student</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('teacher')}
                                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${role === 'teacher' ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-105' : 'bg-white/5 border-white/5 opacity-50 hover:opacity-100'}`}
                                >
                                    <Briefcase size={24} className={role === 'teacher' ? 'text-purple-400' : ''} />
                                    <span className="text-[10px] uppercase font-black tracking-tighter">Teacher</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {error && <div className="text-red-400 text-[10px] font-bold uppercase tracking-wider text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</div>}

                    <button type="submit" disabled={loading} className="btn-premium w-full py-5 text-sm uppercase tracking-widest font-black group items-center justify-center">
                        {loading ? 'Processing Protocol...' : (isLogin ? 'Unlock Portal' : 'Initialize Identity')}
                        {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform inline-block ml-2" />}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-white/5">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest block mx-auto transition-colors"
                    >
                        {isLogin ? "Need a new identity? Request Registration" : "Already registered? Authentication"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
