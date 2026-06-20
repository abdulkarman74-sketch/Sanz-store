import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Copy } from 'lucide-react';
import { useToast } from './ToastProvider';

interface ImagePromptTabProps {
  imagePromptInput: string;
  setImagePromptInput: (v: string) => void;
  handleGeneratePrompt: () => void;
  isGenerating: boolean;
  generatedPrompt: string | null;
}

export const ImagePromptTab = ({
  imagePromptInput, setImagePromptInput, handleGeneratePrompt, isGenerating, generatedPrompt
}: ImagePromptTabProps) => {
  const { addToast } = useToast();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-12 flex flex-col items-center custom-scrollbar">
      <div className="w-full max-w-2xl space-y-8 mt-8">
        <div className="text-center space-y-2">
           <h2 className="text-3xl md:text-4xl font-bold font-display bg-gradient-to-r from-[#FF6B35] to-[#7209B7] bg-clip-text text-transparent pb-1">Image Prompt Generator</h2>
           <p className="text-slate-500">Ubah ide simpel jadi prompt Midjourney/DALL-E yang masterclass.</p>
        </div>

        <div className="space-y-4">
          <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition"></div>
             <textarea 
               value={imagePromptInput}
               onChange={(e) => setImagePromptInput(e.target.value)}
               placeholder="Contoh: Spongebob lagi liburan ke Mars, gaya cyberpunk..."
               className="relative w-full h-32 bg-[#15151E] border border-white/10 rounded-2xl p-4 outline-none resize-none text-base text-slate-100 placeholder:text-slate-600 shadow-2xl backdrop-blur-xl"
             />
          </div>
          <button 
            onClick={handleGeneratePrompt}
            disabled={isGenerating || !imagePromptInput.trim()}
            className="w-full py-4 bg-gradient-to-r from-[#FF6B35] via-[#F72585] to-[#7209B7] text-white font-bold rounded-2xl shadow-xl shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 border-none cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
            GENERATE PROMPT
          </button>
        </div>

        <AnimatePresence>
          {generatedPrompt && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group mt-8 shadow-xl"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#FF6B35] to-[#F72585]"></div>
              <p className="text-lg leading-relaxed mb-6 italic text-slate-200">"{generatedPrompt}"</p>
              <div className="flex gap-3">
                 <button 
                  onClick={() => {navigator.clipboard.writeText(generatedPrompt); addToast("Prompt disalin", "success");}}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-all border border-white/5 shadow-sm cursor-pointer"
                 >
                   <Copy size={18} /> Copy Prompt
                 </button>
                 <button 
                  onClick={handleGeneratePrompt}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5 shadow-sm cursor-pointer"
                 >
                   <RefreshCw size={18} />
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
