/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import OpenAI from 'openai';
import { 
  Book, 
  ShoppingBag, 
  Volume2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  School,
  Store,
  Home,
  Info,
  BookOpen,
  Search,
  Gamepad2,
  Trash2,
  Plus,
  Loader2,
  Sparkles
} from 'lucide-react';

// --- AliCloud (DashScope) Initialization ---
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_ALICLOUD_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  dangerouslyAllowBrowser: true
});

// --- Types ---

interface VocabularyItem {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  icon: React.ReactNode;
  position: { x: number; y: number }; // Percentage based
  color: string;
}

interface Scene {
  id: string;
  name: string;
  chineseName: string;
  icon: React.ReactNode;
  items: VocabularyItem[];
  bgColor: string;
  wallColor: string;
  floorColor: string;
  accentColor: string;
}

// --- Data ---

const SCENES: Scene[] = [
  {
    id: 'classroom',
    name: 'Classroom',
    chineseName: '教室 (Jiàoshì)',
    icon: <School className="w-6 h-6" />,
    bgColor: 'bg-[#FDF6E3]',
    wallColor: 'bg-[#EEE8D5]',
    floorColor: 'bg-[#93A1A1]',
    accentColor: 'text-[#859900]',
    items: [
      { id: 'clock', chinese: '时钟', pinyin: 'shízhōng', english: 'Clock', color: '#93A1A1', icon: <div className="w-12 h-12 bg-white border-4 border-[#586E75] rounded-full flex items-center justify-center"><div className="w-0.5 h-4 bg-black absolute top-2" /><div className="w-3 h-0.5 bg-black absolute right-2" /></div>, position: { x: 50, y: 12 } },
      { id: 'blackboard', chinese: '黑板', pinyin: 'hēibǎn', english: 'Blackboard', color: '#073642', icon: <img src="/blackboard.png" className="w-48 h-24 object-contain" referrerPolicy="no-referrer" />, position: { x: 50, y: 30 } },
      { id: 'desk', chinese: '课桌', pinyin: 'kèzhuō', english: 'Desk', color: '#B58900', icon: <img src="/desk.png" className="w-24 h-16 object-contain" referrerPolicy="no-referrer" />, position: { x: 30, y: 65 } },
      { id: 'chair', chinese: '椅子', pinyin: 'yǐzi', english: 'Chair', color: '#CB4B16', icon: <img src="/chair.png" className="w-16 h-20 object-contain" referrerPolicy="no-referrer" />, position: { x: 20, y: 75 } },
      { id: 'book', chinese: '书', pinyin: 'shū', english: 'Book', color: '#268BD2', icon: <img src="/book.png" className="w-12 h-14 object-contain" referrerPolicy="no-referrer" />, position: { x: 35, y: 60 } },
      { id: 'pen', chinese: '笔', pinyin: 'bǐ', english: 'Pen', color: '#D33682', icon: <img src="/pen.png" className="w-6 h-12 object-contain" referrerPolicy="no-referrer" />, position: { x: 45, y: 62 } },
      { id: 'window', chinese: '窗户', pinyin: 'chuānghu', english: 'Window', color: '#EEE8D5', icon: <img src="/window.png" className="w-24 h-24 object-contain" referrerPolicy="no-referrer" />, position: { x: 80, y: 35 } },
      { id: 'backpack', chinese: '书包', pinyin: 'shūbāo', english: 'Backpack', color: '#D33682', icon: <img src="/backpack.png" className="w-16 h-20 object-contain" referrerPolicy="no-referrer" />, position: { x: 15, y: 85 } },
    ]
  },
  {
    id: 'supermarket',
    name: 'Supermarket',
    chineseName: '超市 (Chāoshì)',
    icon: <Store className="w-6 h-6" />,
    bgColor: 'bg-[#E1F5FE]',
    wallColor: 'bg-[#B3E5FC]',
    floorColor: 'bg-[#B0BEC5]',
    accentColor: 'text-[#0288D1]',
    items: [
      { id: 'poster', chinese: '海报', pinyin: 'hǎibào', english: 'Poster', color: '#D33682', icon: <img src="/poster.png" className="w-12 h-16 object-contain" referrerPolicy="no-referrer" />, position: { x: 15, y: 25 } },
      { id: 'shelf', chinese: '货架', pinyin: 'huòjià', english: 'Shelf', color: '#657B83', icon: <img src="/shelf.png" className="w-48 h-32 object-contain" referrerPolicy="no-referrer" />, position: { x: 50, y: 45 } },
      { id: 'apple', chinese: '苹果', pinyin: 'píngguǒ', english: 'Apple', color: '#DC322F', icon: <img src="/apple.png" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />, position: { x: 25, y: 42 } },
      { id: 'milk', chinese: '牛奶', pinyin: 'niúnǎi', english: 'Milk', color: '#FFFFFF', icon: <img src="/milk.png" className="w-10 h-14 object-contain" referrerPolicy="no-referrer" />, position: { x: 40, y: 38 } },
      { id: 'bread', chinese: '面包', pinyin: 'miànbāo', english: 'Bread', color: '#B58900', icon: <img src="/bread.png" className="w-14 h-10 object-contain" referrerPolicy="no-referrer" />, position: { x: 60, y: 42 } },
      { id: 'cart', chinese: '购物车', pinyin: 'gòuwùchē', english: 'Shopping Cart', color: '#586E75', icon: <img src="/shopping_cart.png" className="w-14 h-14 object-contain" referrerPolicy="no-referrer" />, position: { x: 75, y: 80 } },
      { id: 'banana', chinese: '香蕉', pinyin: 'xiāngjiāo', english: 'Banana', color: '#B58900', icon: <img src="/banana.png" className="w-12 h-6 object-contain" referrerPolicy="no-referrer" />, position: { x: 30, y: 46 } },
      { id: 'egg', chinese: '鸡蛋', pinyin: 'jīdàn', english: 'Egg', color: '#FDF6E3', icon: <img src="/egg.png" className="w-8 h-10 object-contain" referrerPolicy="no-referrer" />, position: { x: 50, y: 40 } },
    ]
  }
];

// --- Components ---

const PixelCard = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }) => (
  <div 
    onClick={onClick}
    className={`relative bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 ${className}`}
  >
    {children}
  </div>
);

const VocabularyOverlay = ({ item, onClose, onAddToNotebook }: { item: VocabularyItem; onClose: () => void; onAddToNotebook: (item: VocabularyItem) => void }) => {
  const speak = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(item.chinese);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  }, [item.chinese]);

  useEffect(() => {
    speak();
  }, [speak]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <PixelCard className="w-full max-w-xs text-center" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-sm transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-4 flex justify-center">
          <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            {item.icon}
          </div>
        </div>

        <h2 className="text-4xl font-bold mb-1 font-sans">{item.chinese}</h2>
        <p className="text-xl text-gray-500 mb-4 font-mono">{item.pinyin}</p>
        
        <div className="h-px bg-black/10 w-full mb-4" />
        
        <p className="text-2xl font-medium mb-6">{item.english}</p>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onAddToNotebook(item)}
            className="flex-1 py-3 bg-[#268BD2] text-white border-b-4 border-[#586E75] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wider"
          >
            <Plus className="w-5 h-5" />
            Add to Notebook
          </button>
          <button 
            onClick={speak}
            className="flex-1 py-3 bg-[#859900] text-white border-b-4 border-[#586E75] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wider"
          >
            <Volume2 className="w-5 h-5" />
            Listen
          </button>
        </div>
      </PixelCard>
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'game' | 'notebook' | 'dictionary'>('game');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<VocabularyItem | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [currentTask, setCurrentTask] = useState<VocabularyItem | null>(null);
  const [score, setScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 80 });
  const [isMoving, setIsMoving] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [notebook, setNotebook] = useState<VocabularyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResult, setAiResult] = useState<VocabularyItem | null>(null);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // All available items for dictionary search
  const allItems = SCENES.flatMap(scene => scene.items);

  const searchWithAI = async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingAI(true);
    setAiResult(null);

    try {
      const completion = await openai.chat.completions.create({
        model: "qwen-plus",
        messages: [
          { role: "system", content: "You are a helpful Chinese-English dictionary. Translate the English word to Chinese. Provide the Chinese characters, Pinyin, and a short English definition. Return in JSON format like: {\"chinese\": \"...\", \"pinyin\": \"...\", \"english\": \"...\"}" },
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" }
      });

      const data = JSON.parse(completion.choices[0].message.content || "{}");
      setAiResult({
        id: `ai-${Date.now()}`,
        chinese: data.chinese || "Error",
        pinyin: data.pinyin || "",
        english: data.english || query,
        color: '#D33682',
        icon: <Sparkles className="w-8 h-8 text-[#D33682]" />,
        position: { x: 0, y: 0 }
      });
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setIsSearchingAI(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dictionary' && searchQuery.trim()) {
      const localResults = allItems.filter(item => 
        item.english.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (localResults.length === 0) {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
          searchWithAI(searchQuery);
        }, 800);
      } else {
        setAiResult(null);
      }
    } else {
      setAiResult(null);
    }
    
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, activeTab]);

  const addToNotebook = (item: VocabularyItem) => {
    if (!notebook.find(n => n.id === item.id)) {
      setNotebook([...notebook, item]);
    }
  };

  const removeFromNotebook = (id: string) => {
    setNotebook(notebook.filter(item => item.id !== id));
  };

  const currentScene = SCENES[currentSceneIndex];

  const startNewTask = useCallback(() => {
    const randomItem = currentScene.items[Math.floor(Math.random() * currentScene.items.length)];
    setCurrentTask(randomItem);
    setShowHint(false);
  }, [currentScene]);

  useEffect(() => {
    if (!showIntro && !currentTask) {
      startNewTask();
    }
  }, [showIntro, currentTask, startNewTask]);

  const nextScene = () => {
    setCurrentSceneIndex((prev) => (prev + 1) % SCENES.length);
    setCurrentTask(null);
    setPlayerPos({ x: 50, y: 80 });
  };
  const prevScene = () => {
    setCurrentSceneIndex((prev) => (prev - 1 + SCENES.length) % SCENES.length);
    setCurrentTask(null);
    setPlayerPos({ x: 50, y: 80 });
  };

  const playSuccessSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const handleItemClick = (item: VocabularyItem) => {
    if (isMoving) return;
    setIsMoving(true);
    
    // Move character to the item's location
    setPlayerPos({ x: item.position.x, y: item.position.y + 8 });
    
    // Wait for the walking animation to finish before showing the word
    setTimeout(() => {
      setIsMoving(false);
      setSelectedItem(item);
      if (currentTask && item.id === currentTask.id) {
        setScore(s => s + 10);
        setShowSuccess(true);
        playSuccessSound();
        setTimeout(() => {
          setShowSuccess(false);
          startNewTask();
        }, 1500);
      }
    }, 800);
  };

  const handleSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMoving) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Character can move anywhere on the floor (y > 45)
    if (y > 45) {
      setPlayerPos({ x, y });
    }
  };

  return (
    <div className={`min-h-screen ${activeTab === 'game' ? currentScene.bgColor : 'bg-gray-50'} transition-colors duration-500 font-sans text-[#073642] overflow-hidden flex flex-col`}>
      {/* Header */}
      <header className="p-4 flex items-center justify-between z-10 bg-white/50 backdrop-blur-sm border-b-2 border-black">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black flex items-center justify-center rounded-sm shadow-[2px_2px_0px_0px_rgba(133,153,0,1)]">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">HanMeet</h1>
            <p className="text-xs opacity-60">Situational Chinese</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center bg-black/5 p-1 rounded-lg border border-black/10">
          <button 
            onClick={() => setActiveTab('game')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'game' ? 'bg-black text-white shadow-md' : 'hover:bg-black/5'}`}
          >
            <Gamepad2 className="w-4 h-4" />
            Game
          </button>
          <button 
            onClick={() => setActiveTab('notebook')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'notebook' ? 'bg-black text-white shadow-md' : 'hover:bg-black/5'}`}
          >
            <BookOpen className="w-4 h-4" />
            Notebook
          </button>
          <button 
            onClick={() => setActiveTab('dictionary')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'dictionary' ? 'bg-black text-white shadow-md' : 'hover:bg-black/5'}`}
          >
            <Search className="w-4 h-4" />
            Dictionary
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {activeTab === 'game' && (
            <>
              <button 
                onClick={() => setScore(0)}
                className="text-[10px] font-bold uppercase opacity-40 hover:opacity-100 transition-opacity"
              >
                Reset
              </button>
              <div className="bg-white border-2 border-black px-3 py-1 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-xs font-bold uppercase">Score</span>
                <span className="font-mono font-bold text-lg">{score}</span>
              </div>
            </>
          )}
          <button 
            onClick={() => setShowIntro(true)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden flex items-center justify-around bg-white border-b-2 border-black p-2 z-10">
        <button onClick={() => setActiveTab('game')} className={`p-2 rounded-lg ${activeTab === 'game' ? 'bg-black text-white' : ''}`}><Gamepad2 className="w-6 h-6" /></button>
        <button onClick={() => setActiveTab('notebook')} className={`p-2 rounded-lg ${activeTab === 'notebook' ? 'bg-black text-white' : ''}`}><BookOpen className="w-6 h-6" /></button>
        <button onClick={() => setActiveTab('dictionary')} className={`p-2 rounded-lg ${activeTab === 'dictionary' ? 'bg-black text-white' : ''}`}><Search className="w-6 h-6" /></button>
      </nav>

      {/* Main Content Modules */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'game' && (
          <div className="h-full flex flex-col">
            {/* Task Banner - Reversed Logic for Learning */}
            <AnimatePresence>
              {currentTask && !showIntro && (
                <motion.div 
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="px-4 py-3 bg-black text-white flex items-center justify-center gap-8 z-20 shadow-lg"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#859900] mb-1">Task: Find</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-[#859900] pixel-font">{currentTask.chinese}</span>
                      <span className="text-sm font-mono opacity-60">({currentTask.pinyin})</span>
                    </div>
                  </div>

                  <div className="h-10 w-px bg-white/20" />

                  <button 
                    onClick={() => setShowHint(!showHint)}
                    className="flex flex-col items-center group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity mb-1">Hint</span>
                    <div className="bg-white/10 hover:bg-white/20 px-4 py-1 rounded border border-white/20 transition-colors min-w-[100px] text-center">
                      {showHint ? (
                        <span className="text-sm font-bold text-[#268BD2]">{currentTask.english}</span>
                      ) : (
                        <span className="text-sm opacity-40 italic">Click to reveal</span>
                      )}
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scene Area */}
            <main className="flex-1 relative flex flex-col items-center justify-center p-4">
              <div 
                onClick={handleSceneClick}
                className="w-full max-w-3xl aspect-[16/9] relative bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden cursor-pointer group"
              >
                {/* Detailed Background with Image Support */}
                <div className="absolute inset-0 transition-all duration-700">
                  {/* Background Image - Using uploaded file */}
                  <div 
                    className={`absolute inset-0 bg-cover bg-center`}
                    style={{ 
                      backgroundImage: currentScene.id === 'supermarket' 
                        ? 'url(/supermarket_bg.jpg)' 
                        : 'url(/classroom_background.jpg)'
                    }}
                  />
                  {/* Fallback colors if image fails to load */}
                  <div className={`absolute inset-0 ${currentScene.wallColor} h-[55%] opacity-20`} />
                  <div className={`absolute bottom-0 left-0 right-0 ${currentScene.floorColor} h-[45%] border-t-8 border-black/10 opacity-20`} />
                </div>
                
                {/* Success Overlay */}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                      className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                    >
                      <div className="bg-[#859900] text-white px-10 py-5 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-4xl font-bold uppercase tracking-tighter pixel-font">
                        Awesome! +10
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Character */}
                <motion.div 
                  animate={{ 
                    left: `${playerPos.x}%`, 
                    top: `${playerPos.y}%`,
                    scale: isMoving ? [1, 1.1, 1] : [1, 1.02, 1],
                    rotate: isMoving ? [0, -5, 5, 0] : 0
                  }}
                  transition={{ 
                    left: { type: "tween", duration: 0.8, ease: "easeInOut" },
                    top: { type: "tween", duration: 0.8, ease: "easeInOut" },
                    scale: { repeat: Infinity, duration: 0.4 },
                    rotate: { repeat: Infinity, duration: 0.2 }
                  }}
                  className="absolute z-30 -translate-x-1/2 -translate-y-[90%] pointer-events-none"
                >
                  <div className="relative">
                    {/* Character Image - Using uploaded file */}
                    <div 
                      className="w-20 h-24 bg-contain bg-no-repeat bg-center relative"
                      style={{ backgroundImage: 'url(/character.png)' }}
                    >
                      {/* Fallback character if image is missing or empty */}
                      <div className="absolute inset-0 bg-[#FDF6E3] border-4 border-black rounded-t-2xl opacity-0 hover:opacity-100 transition-opacity">
                         <div className="absolute top-5 left-3 w-2.5 h-2.5 bg-black rounded-full" />
                         <div className="absolute top-5 right-3 w-2.5 h-2.5 bg-black rounded-full" />
                      </div>
                    </div>
                    {/* Dynamic Shadow */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/30 rounded-full blur-[3px]" />
                    
                    {/* Thinking Bubble when moving */}
                    {isMoving && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-12 -right-4 bg-white border-2 border-black px-3 py-1 text-xs font-bold rounded-full shadow-lg"
                      >
                        {currentTask ? `Looking for ${currentTask.chinese}...` : "Walking..."}
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Items */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentScene.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    {currentScene.items.map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20"
                        style={{ left: `${item.position.x}%`, top: `${item.position.y}%` }}
                      >
                        <div className="relative p-2 bg-white/0 hover:bg-white/20 rounded-xl transition-colors">
                          {item.icon}
                          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-black text-white text-[10px] px-2 py-1 rounded-sm whitespace-nowrap z-30 shadow-lg">
                            {item.english}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Scene Label */}
                <div className="absolute top-6 left-6 bg-black text-white px-4 py-2 text-sm font-bold flex items-center gap-3 z-10 shadow-xl border-2 border-[#859900]">
                  {currentScene.icon}
                  <span className="tracking-wider">{currentScene.chineseName}</span>
                </div>
              </div>

              {/* Scene Navigation */}
              <div className="mt-8 flex items-center gap-6">
                <button 
                  onClick={prevScene}
                  className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-1">Current Scene</p>
                  <h3 className="text-xl font-bold">{currentScene.name}</h3>
                </div>
                <button 
                  onClick={nextScene}
                  className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </main>
          </div>
        )}

        {activeTab === 'notebook' && (
          <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-[#268BD2]" />
                My Notebook
              </h2>
              <span className="bg-[#268BD2] text-white px-4 py-1 rounded-full text-sm font-bold">
                {notebook.length} Words Saved
              </span>
            </div>

            {notebook.length === 0 ? (
              <div className="text-center py-20 bg-white border-4 border-dashed border-gray-200 rounded-xl">
                <Book className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Your notebook is empty. Explore the game to add words!</p>
                <button 
                  onClick={() => setActiveTab('game')}
                  className="mt-6 px-6 py-2 bg-black text-white font-bold rounded-lg hover:scale-105 transition-transform"
                >
                  Go to Game
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notebook.map((item) => (
                  <motion.div 
                    layout
                    key={item.id}
                    className="bg-white border-4 border-black p-4 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-gray-100">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-xl font-bold">{item.chinese}</h3>
                        <span className="text-xs font-mono text-gray-400">{item.pinyin}</span>
                      </div>
                      <p className="text-gray-600 font-medium uppercase text-xs tracking-wider">{item.english}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          const utterance = new SpeechSynthesisUtterance(item.chinese);
                          utterance.lang = 'zh-CN';
                          window.speechSynthesis.speak(utterance);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#859900]"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => removeFromNotebook(item.id)}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dictionary' && (
          <div className="p-6 max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                <Search className="w-8 h-8 text-[#D33682]" />
                Dictionary
              </h2>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search English word..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xl font-medium focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all pr-12"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-4">
              {searchQuery.length > 0 ? (
                <>
                  {/* Local Results */}
                  {allItems
                    .filter(item => item.english.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(item => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={item.id}
                        className="bg-white border-2 border-black p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 flex items-center justify-center">{item.icon}</div>
                          <div>
                            <h3 className="text-3xl font-bold text-[#D33682]">{item.chinese}</h3>
                            <p className="text-lg font-mono text-gray-400">{item.pinyin}</p>
                            <p className="text-sm font-bold uppercase tracking-widest mt-1">{item.english}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => addToNotebook(item)}
                            className="p-3 bg-[#268BD2] text-white rounded-lg hover:scale-110 transition-transform"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => {
                              const utterance = new SpeechSynthesisUtterance(item.chinese);
                              utterance.lang = 'zh-CN';
                              window.speechSynthesis.speak(utterance);
                            }}
                            className="p-3 bg-[#859900] text-white rounded-lg hover:scale-110 transition-transform"
                          >
                            <Volume2 className="w-6 h-6" />
                          </button>
                        </div>
                      </motion.div>
                    ))}

                  {/* AI Results */}
                  {isSearchingAI && (
                    <div className="flex flex-col items-center py-10 text-gray-400 animate-pulse">
                      <Loader2 className="w-10 h-10 animate-spin mb-2" />
                      <p className="text-sm font-bold uppercase tracking-widest">Searching AI Dictionary...</p>
                    </div>
                  )}

                  {aiResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-white to-pink-50 border-4 border-[#D33682] p-6 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(211,54,130,1)]"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-inner">
                          {aiResult.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-3xl font-bold text-[#D33682]">{aiResult.chinese}</h3>
                            <span className="bg-[#D33682] text-white text-[8px] px-1 rounded uppercase font-bold">AI</span>
                          </div>
                          <p className="text-lg font-mono text-gray-400">{aiResult.pinyin}</p>
                          <p className="text-sm font-bold uppercase tracking-widest mt-1">{aiResult.english}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => addToNotebook(aiResult)}
                          className="p-3 bg-[#268BD2] text-white rounded-lg hover:scale-110 transition-transform"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={() => {
                            const utterance = new SpeechSynthesisUtterance(aiResult.chinese);
                            utterance.lang = 'zh-CN';
                            window.speechSynthesis.speak(utterance);
                          }}
                          className="p-3 bg-[#859900] text-white rounded-lg hover:scale-110 transition-transform"
                        >
                          <Volume2 className="w-6 h-6" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {searchQuery.length > 0 && 
                   allItems.filter(item => item.english.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && 
                   !isSearchingAI && !aiResult && (
                    <div className="text-center py-10 text-gray-400">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 opacity-30">
                  <Search className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-xl font-bold">Type to search the dictionary</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Progress */}
      <footer className="p-6 text-center">
        <p className="text-sm opacity-60">Click on objects to learn their Chinese names!</p>
      </footer>

      {/* Overlays */}
      <AnimatePresence>
        {selectedItem && (
          <VocabularyOverlay 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onAddToNotebook={addToNotebook}
          />
        )}

        {showIntro && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#FDF6E3]/95 backdrop-blur-md"
          >
            <PixelCard className="max-w-md w-full">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-black flex items-center justify-center rounded-sm">
                  <span className="text-white text-sm">H</span>
                </div>
                Welcome to HanMeet!
              </h2>
              <p className="mb-4 text-lg leading-relaxed">
                Explore real-life scenarios like <strong>Classrooms</strong> and <strong>Supermarkets</strong> to master Chinese vocabulary naturally.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-green-100 rounded">
                    <Store className="w-4 h-4 text-green-700" />
                  </div>
                  <p className="text-sm">Click objects to see their Chinese names and Pinyin.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-blue-100 rounded">
                    <Volume2 className="w-4 h-4 text-blue-700" />
                  </div>
                  <p className="text-sm">Listen to native pronunciation with the audio button.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-orange-100 rounded">
                    <ChevronRight className="w-4 h-4 text-orange-700" />
                  </div>
                  <p className="text-sm">Complete tasks to earn points and reinforce memory!</p>
                </div>
              </div>
              <button 
                onClick={() => setShowIntro(false)}
                className="w-full py-4 bg-black text-white font-bold text-xl shadow-[4px_4px_0px_0px_rgba(133,153,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(133,153,0,1)] transition-all uppercase tracking-widest"
              >
                Start Learning
              </button>
            </PixelCard>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=JetBrains+Mono&family=Press+Start+2P&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .pixel-font {
          font-family: 'Press Start 2P', cursive;
        }
      `}} />
    </div>
  );
}
