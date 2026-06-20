import React from 'react';
import { Plus, MessageSquare, Trash2, User, Sun, Moon, Sparkles } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Chat } from '../types';
import { useToast } from './ToastProvider';

interface SidebarProps {
  userId: string;
  chats: Chat[];
  currentChatId: string | null;
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
  handleNewChat: () => void;
  setCurrentChatId: (id: string) => void;
  setActiveTab: (tab: 'chat' | 'image') => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
}

export const Sidebar = ({
  userId, chats, currentChatId, sidebarOpen, setSidebarOpen, handleNewChat, setCurrentChatId, setActiveTab, darkMode, setDarkMode
}: SidebarProps) => {
  const { addToast } = useToast();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Yakin mau hapus percakapan ini?")) {
      await deleteDoc(doc(db, 'chats', id));
      if (currentChatId === id) {
        handleNewChat();
      }
      addToast("Chat dihapus", "success");
    }
  };

  return (
    <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} absolute md:relative z-40 w-[280px] h-full transition-transform duration-300 bg-[#0F0F16] border-r border-white/5 flex flex-col`}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] via-[#F72585] to-[#7209B7] flex items-center justify-center shadow-lg shadow-pink-500/20">
          <Sparkles className="text-white" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight text-white font-display">Phoenix AI</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Ignite Your Ideas</p>
        </div>
      </div>

      <div className="px-4 mb-6">
        <button 
          onClick={handleNewChat}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F72585] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all border-none cursor-pointer"
        >
          <Plus size={20} /> New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-6 custom-scrollbar">
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">History</p>
          <div className="space-y-1">
            {chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => { setCurrentChatId(chat.id); setActiveTab('chat'); if(window.innerWidth < 768) setSidebarOpen(false); }}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${currentChatId === chat.id ? 'bg-white/5 border border-white/5' : 'hover:bg-white/5'}`}
              >
                <MessageSquare size={16} className={currentChatId === chat.id ? "text-slate-400 shrink-0" : "text-slate-500 shrink-0"} />
                <span className={`flex-1 text-sm truncate ${currentChatId === chat.id ? "font-medium text-white" : "text-slate-400"}`}>{chat.title}</span>
                <button onClick={(e) => deleteChat(chat.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all shrink-0 cursor-pointer bg-transparent border-none">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
