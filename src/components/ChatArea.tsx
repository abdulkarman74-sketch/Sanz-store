import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, RefreshCw, Send, Sparkles } from 'lucide-react';
import { Message, Model } from '../types';
import { useToast } from './ToastProvider';

interface ChatAreaProps {
  messages: Message[];
  isGenerating: boolean;
  input: string;
  setInput: (v: string) => void;
  sendMessage: (e: React.FormEvent) => void;
  darkMode: boolean;
}

export const ChatArea = ({ messages, isGenerating, input, setInput, sendMessage, darkMode }: ChatAreaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 flex flex-col custom-scrollbar">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center space-y-6 pt-20">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
              <Sparkles size={48} className="text-pink-500 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight text-white font-display">Mau ngobrol soal apa hari ini?</h2>
              <p className="text-slate-500 text-lg">Pilih topik starter atau tulis ide liarmu di bawah.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 w-full text-left">
              <button onClick={() => setInput('Buatkan landing page modern')} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-pink-500/50 transition-all group cursor-pointer block w-full text-left">
                <div className="text-pink-500 mb-1"><Sparkles size={20} /></div>
                <p className="text-sm font-bold text-slate-200">Landing page modern</p>
                <p className="text-[11px] text-slate-500">Buatkan struktur dan copy UI</p>
              </button>
              <button onClick={() => setInput('Jelaskan cara fix bug JavaScript')} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all group cursor-pointer block w-full text-left">
                <div className="text-blue-500 mb-1"><Sparkles size={20} /></div>
                <p className="text-sm font-bold text-slate-200">Fix bug JavaScript</p>
                <p className="text-[11px] text-slate-500">Analisis error dan beri solusi</p>
              </button>
              <button onClick={() => setInput('Buatkan prompt gambar naga api')} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-orange-500/50 transition-all group cursor-pointer block w-full text-left">
                <div className="text-orange-500 mb-1"><Sparkles size={20} /></div>
                <p className="text-sm font-bold text-slate-200">Prompt gambar naga</p>
                <p className="text-[11px] text-slate-500">Generate prompt artistik detail</p>
              </button>
              <button onClick={() => setInput('Tulis puisi tentang Phoenix')} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all group cursor-pointer block w-full text-left">
                <div className="text-purple-500 mb-1"><Sparkles size={20} /></div>
                <p className="text-sm font-bold text-slate-200">Tulis puisi filosofis</p>
                <p className="text-[11px] text-slate-500">Inspirasi mendalam tentang Phoenix</p>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-4 shadow-sm group ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-[#FF6B35] to-[#F72585] text-white rounded-br-none shadow-lg shadow-pink-500/20' 
                  : msg.isError 
                    ? 'bg-red-500/10 border border-red-500/50 text-red-400' 
                    : 'bg-[#15151E] border border-white/10 rounded-bl-none shadow-xl'
              }`}>
                <div className="markdown-content text-sm leading-relaxed overflow-x-auto text-slate-200">
                  <ReactMarkdown
                    components={{
                      code(props) {
                        const {children, className, node, ...rest} = props;
                        const match = /language-(\w+)/.exec(className || '');
                        if (!match) {
                            return <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-xs text-white" {...rest}>{children}</code>;
                        }
                        return (
                          <div className="relative group/code my-4">
                            <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity z-10">
                              <button 
                                onClick={() => {navigator.clipboard.writeText(String(children)); addToast("Kode disalin", "success");}} 
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md text-white border-none cursor-pointer"
                              ><Copy size={14} /></button>
                            </div>
                            <SyntaxHighlighter
                              style={darkMode ? atomDark : undefined}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-xl !bg-[#0A0A0F] !border !border-white/10 !p-4 custom-scrollbar text-sm"
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.role === 'assistant' && (
                  <div className="mt-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => {navigator.clipboard.writeText(msg.content); addToast("Teks disalin", "success");}} className="text-slate-500 hover:text-white border-none bg-transparent cursor-pointer"><Copy size={14} /></button>
                     <button className="text-slate-500 hover:text-white border-none bg-transparent cursor-pointer"><RefreshCw size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isGenerating && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-[#15151E] border border-white/10 shadow-xl rounded-2xl rounded-bl-none px-5 py-4">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{animationDelay: '0s'}}></div>
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
              <p className="text-[10px] mt-2 text-slate-500 font-mono italic">Phoenix AI sedang berpikir...</p>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-8 bg-gradient-to-t from-[#0A0A0F] to-transparent shrink-0">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B35] to-[#F72585] rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-1000"></div>
          <div className="relative flex items-end gap-4 bg-[#15151E] border border-white/10 rounded-2xl p-3 pl-6 shadow-2xl backdrop-blur-xl">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
              placeholder="Tanyakan apa saja kepada Phoenix AI..."
              rows={1}
              className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-slate-100 placeholder:text-slate-600 resize-none max-h-40"
            />
            <div className="flex gap-2 shrink-0">
              <button 
                type="submit"
                disabled={!input.trim() || isGenerating}
                className="p-3 bg-gradient-to-r from-[#FF6B35] to-[#F72585] text-white rounded-xl shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale border-none cursor-pointer"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center px-4 mt-2">
             <p className="text-[10px] text-slate-600 font-medium tracking-wide uppercase">Tokens: {input.length} / 2,000</p>
             <p className="text-[10px] text-slate-600">Phoenix AI can make mistakes. Verify critical info.</p>
          </div>
        </form>
      </div>
    </>
  );
};
