/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Menu, ChevronDown } from 'lucide-react';
import { auth, db } from './firebase';
import { MODELS, UserData, Chat, Message, Model } from './types';
import { ToastProvider, useToast } from './components/ToastProvider';
import { AuthForm } from './components/AuthForm';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ImagePromptTab } from './components/ImagePromptTab';

const parseAIResponse = (data: any) => {
  if (typeof data === 'string') return data;
  return data.result || data.response || data.message || JSON.stringify(data);
};

export function MainApp() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'image'>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePromptInput, setImagePromptInput] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  
  const { addToast } = useToast();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          const newUser = {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            photoURL: u.photoURL,
            theme: 'dark' as const,
            createdAt: serverTimestamp()
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
          setDarkMode(true);
        } else {
          const data = userDoc.data() as UserData;
          setUser({ ...data, uid: u.uid });
          setDarkMode(data.theme === 'dark');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Chat)));
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!currentChatId) {
      setMessages([]);
      return;
    }
    const unsub = onSnapshot(doc(db, 'chats', currentChatId), (document) => {
      if (document.exists()) {
        const data = document.data() as Chat;
        setMessages(data.messages || []);
        const modelUsed = MODELS.find(m => m.id === data.model);
        if (modelUsed) setSelectedModel(modelUsed);
      }
    });
    return unsub;
  }, [currentChatId]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    if (darkMode && !isDark) {
      document.documentElement.classList.add('dark');
    } else if (!darkMode && isDark) {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setActiveTab('chat');
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating || !user) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date().toISOString() };
    let chatId = currentChatId;
    let currentSessionId = uuidv4();

    if (!chatId) {
      const newChatData = {
        userId: user.uid,
        title: input.substring(0, 30),
        model: selectedModel.id,
        sessionId: currentSessionId,
        messages: [userMsg],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const newDoc = await addDoc(collection(db, 'chats'), newChatData);
      chatId = newDoc.id;
      setCurrentChatId(chatId);
    } else {
      const chatSnap = await getDoc(doc(db, 'chats', chatId));
      if (chatSnap.exists()) {
        currentSessionId = chatSnap.data().sessionId || uuidv4();
        await updateDoc(doc(db, 'chats', chatId), {
          messages: [...(chatSnap.data().messages || []), userMsg],
          updatedAt: serverTimestamp()
        });
      }
    }

    const currentInput = input;
    setInput('');
    setIsGenerating(true);

    try {
      let url = `${selectedModel.endpoint}?pesan=${encodeURIComponent(currentInput)}`;
      if (selectedModel.id === 'ai-coder') {
        url = `${selectedModel.endpoint}?prompt=${encodeURIComponent(currentInput)}&session=${currentSessionId}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('API Down');
      const data = await res.json();
      const aiContent = parseAIResponse(data);

      const aiMsg: Message = { role: 'assistant', content: aiContent, timestamp: new Date().toISOString() };
      const updatedChatSnap = await getDoc(doc(db, 'chats', chatId));
      if (updatedChatSnap.exists()) {
         await updateDoc(doc(db, 'chats', chatId), {
           messages: [...(updatedChatSnap.data().messages || []), aiMsg],
           updatedAt: serverTimestamp()
         });
      }
    } catch (err) {
      const errMsg: Message = { role: 'assistant', content: `Gagal mendapat respons dari ${selectedModel.name}, coba lagi ya 🔥`, timestamp: new Date().toISOString(), isError: true };
      const updatedChatSnap = await getDoc(doc(db, 'chats', chatId));
      if (updatedChatSnap.exists()) {
         await updateDoc(doc(db, 'chats', chatId), {
           messages: [...(updatedChatSnap.data().messages || []), errMsg],
           updatedAt: serverTimestamp()
         });
      }
      addToast("Failed to get response", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!imagePromptInput.trim() || !user) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`https://api.synoxcloud.xyz/ai-generate/text-to-prompt?q=${encodeURIComponent(imagePromptInput)}`);
      if (!res.ok) throw new Error('API down');
      const data = await res.json();
      const prompt = parseAIResponse(data);
      setGeneratedPrompt(prompt);
      await addDoc(collection(db, 'imagePrompts'), {
        userId: user.uid,
        inputQuery: imagePromptInput,
        generatedPrompt: prompt,
        createdAt: serverTimestamp()
      });
      addToast("Prompt berhasil dibuat", "success");
    } catch (e) {
      addToast("Gagal generate prompt", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0A0A0F]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-500"></div>
    </div>
  );

  if (!user) return <AuthForm />;

  return (
    <div className="flex h-screen w-full bg-[#0A0A0F] text-slate-100 font-sans overflow-hidden">
      <Sidebar 
        user={user} 
        chats={chats} 
        currentChatId={currentChatId} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        handleNewChat={handleNewChat}
        setCurrentChatId={setCurrentChatId}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0A0A0F]/80 backdrop-blur-xl shrink-0">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 relative">
             <button 
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all border-none focus:outline-none cursor-pointer ${activeTab === 'chat' ? 'bg-white/10 text-white shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-300'}`}
            >CHAT</button>
            <button 
              onClick={() => setActiveTab('image')}
              className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all border-none focus:outline-none cursor-pointer ${activeTab === 'image' ? 'bg-white/10 text-white shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-300'}`}
            >PROMPT GENERATOR</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-pink-500/50 bg-pink-500/10 text-pink-500 text-[11px] font-bold tracking-tight uppercase cursor-pointer">
                {selectedModel.name} <ChevronDown size={14} strokeWidth={2.5} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#15151E] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                {MODELS.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-l-4 border-transparent hover:border-pink-500 cursor-pointer bg-transparent"
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
            
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-white/5 md:hidden rounded-lg text-slate-400 border border-white/5 cursor-pointer flex items-center justify-center hover:bg-white/10">
              <Menu size={16} />
            </button>
          </div>
        </header>

        {activeTab === 'chat' ? (
          <ChatArea 
            messages={messages} 
            isGenerating={isGenerating} 
            input={input} 
            setInput={setInput} 
            sendMessage={sendMessage} 
            darkMode={darkMode} 
          />
        ) : (
          <ImagePromptTab 
            imagePromptInput={imagePromptInput}
            setImagePromptInput={setImagePromptInput}
            handleGeneratePrompt={handleGeneratePrompt}
            isGenerating={isGenerating}
            generatedPrompt={generatedPrompt}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
