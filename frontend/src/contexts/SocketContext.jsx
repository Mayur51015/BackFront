import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
        const newSocket = io(socketUrl);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to Relay Hub:', newSocket.id);
        });

        newSocket.on('NEW_SESSION', (data) => {
            // Only notify students who belong to the TARGET CLASS
            if (isAuthenticated && user?.role === 'student' && user?.className === data.targetClass) {
                toast.custom((t) => (

                    <div className={`${t.visible ? 'animate-slide-up' : 'animate-fade-out'} max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl pointer-events-auto flex items-center overflow-hidden`}>
                        <div className="flex-1 w-0 p-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                        <span className="text-xl animate-pulse">📡</span>
                                    </div>
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-black text-white uppercase tracking-widest">
                                        Live Attendance Session
                                    </p>
                                    <p className="mt-1 text-xs font-bold text-white/50 leading-relaxed uppercase tracking-tighter">
                                        {data.teacherName} has started a session. <br /> Join Code: <span className="text-indigo-400 font-black">{data.joinCode}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-white/10">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    window.location.href = isAuthenticated ? `/student?code=${data.joinCode}` : `/auth`;
                                }}

                                className="w-full border border-transparent rounded-none rounded-r-3xl p-6 flex items-center justify-center text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 focus:outline-none transition-colors"
                            >
                                Join Now
                            </button>
                        </div>
                    </div>
                ), { duration: 10000, position: 'top-right' });
            }
        });

        return () => newSocket.close();
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
