import React, { useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export interface Notification {
    id: string;
    message: string;
    timestamp: number;
}

interface NotificationToastProps {
    notifications: Notification[];
    onClose: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onClose }) => {
    return (
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 pointer-events-none">
            {notifications.map((notif) => (
                <div 
                    key={notif.id} 
                    className="pointer-events-auto bg-slate-800 border-l-4 border-yellow-500 text-white p-4 rounded shadow-2xl flex items-start gap-3 w-80 animate-in slide-in-from-right duration-300"
                >
                    <div className="bg-yellow-500/20 p-2 rounded-full">
                        <Bell size={16} className="text-yellow-500" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-100">Price Alert Triggered!</h4>
                        <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                        <p className="text-[10px] text-slate-500 mt-2">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <button 
                        onClick={() => onClose(notif.id)}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};
