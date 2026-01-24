import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ShieldCheck, Loader2, LogOut, ArrowRight, Activity, Zap, Lock, ShieldAlert } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Lazy loading for Green Coding (Optimization)
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const Auth = lazy(() => import('./pages/Auth'));

const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>;
  if (!isAuthenticated) return <Navigate to="/auth" />;

  if (user?.role === 'unverified') {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6 animate-slide-up">
        <div className="p-6 rounded-full bg-amber-500/10 border border-amber-500/20 w-fit mx-auto">
          <ShieldAlert className="text-amber-500" size={48} />
        </div>
        <h2 className="text-3xl font-black font-heading uppercase tracking-tighter text-white">Profile Sync Failure</h2>
        <p className="text-white/50 font-medium leading-relaxed">
          We've authenticated your identity, but our backend systems are currently unreachable or your profile is incomplete.
          Please contact your administrator or try again in a few minutes.
        </p>
        <button onClick={() => window.location.reload()} className="btn-premium !py-3 !px-8 text-xs">Retry Sync Protocol</button>
      </div>
    );
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} />;
  }
  return children;
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  return (
    <nav className="m-6 flex justify-between items-center px-8 py-4 glass-panel rounded-full sticky top-6 z-50">
      <Link to="/" className="flex items-center gap-2 text-primary font-bold text-2xl no-underline tracking-tighter">
        <ShieldCheck size={32} className="text-accent" />
        <span className="bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent font-heading">SmartAttend</span>
      </Link>
      <div className="flex gap-8 items-center">
        {isAuthenticated ? (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white leading-none mb-1">{user.name}</p>
              <div className="flex justify-end gap-1">
                <span className="badge-premium bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{user.role}</span>
              </div>
            </div>
            <button onClick={logout} className="p-2.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link to="/auth" className="btn-premium !py-2.5 !px-6 text-sm">Sign In</Link>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen">
            <Toaster position="top-right" />
            <Navbar />

            <main className="container mx-auto px-6 py-4">
              <Suspense fallback={
                <div className="flex h-[60vh] flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <Loader2 className="animate-spin text-primary" size={64} />
                    <div className="absolute inset-0 blur-2xl bg-indigo-500 opacity-30 animate-pulse"></div>
                  </div>
                  <p className="text-text-muted font-medium tracking-widest uppercase text-xs">Connecting to Secure Cloud...</p>
                </div>
              }>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/teacher" element={
                    <ProtectedRoute role="teacher">
                      <TeacherDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/student" element={
                    <ProtectedRoute role="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/" element={<Home />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </main>

            <footer className="mt-40 py-12 border-t border-glass-border">
              <div className="container mx-auto px-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-white/20 font-bold tracking-tighter">
                  <ShieldCheck size={20} /> SmartAttend AI
                </div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-medium">
                  Green Coding Architecture &copy; 2026 • Secure Biometrics
                </p>
              </div>
            </footer>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <section className="text-center py-24 px-4 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
          <Zap size={14} /> New: Face-ID Verification Enabled
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
          Attendance <br />
          <span className="text-gradient">Redefined.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          A high-performance, green-first platform using <span className="text-white font-medium">Bio-Identity</span> and <span className="text-white font-medium">Geo-fencing</span> to eliminate classroom proxies.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          {!isAuthenticated ? (
            <Link to="/auth" className="btn-premium px-12 py-5 text-lg group">
              Enter Global Portal <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link
              to={user.role === 'teacher' ? "/teacher" : "/student"}
              className="btn-premium px-12 py-5 text-lg"
            >
              Launch {user.role === 'teacher' ? 'Management Console' : 'Marking Portal'}
            </Link>
          )}
        </div>
      </section>

      {/* Features Preview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
        <div className="glass-panel glass-panel-hover p-10 group">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-8 border border-accent/20 group-hover:scale-110 transition-all">
            <Activity className="text-accent" size={28} />
          </div>
          <h3 className="text-xl font-bold mb-4 font-heading tracking-tight">Precision GPS</h3>
          <p className="text-sm text-white/50 leading-relaxed font-medium">Haversine-based geo-fencing ensures students are physically present in the lecture hall.</p>
        </div>
        <div className="glass-panel glass-panel-hover p-10 group">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-all">
            <Lock className="text-primary" size={28} />
          </div>
          <h3 className="text-xl font-bold mb-4 font-heading tracking-tight">Anti-Spoofing</h3>
          <p className="text-sm text-white/50 leading-relaxed font-medium">Biometric face recognition prevents buddy-marking and identity theft during sessions.</p>
        </div>
        <div className="glass-panel glass-panel-hover p-10 group">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-8 border border-secondary/20 group-hover:scale-110 transition-all">
            <ShieldCheck className="text-secondary" size={28} />
          </div>
          <h3 className="text-xl font-bold mb-4 font-heading tracking-tight">Audit Logs</h3>
          <p className="text-sm text-white/50 leading-relaxed font-medium">Every teacher override is cryptographically linked and logged for department review.</p>
        </div>
      </section>
    </div>
  );
};

export default App;
