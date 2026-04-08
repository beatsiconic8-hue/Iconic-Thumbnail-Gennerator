/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Camera, 
  Search, 
  Zap, 
  Layout, 
  Copy, 
  Check, 
  Music, 
  Sparkles,
  ChevronRight,
  Monitor,
  Smartphone,
  Hash,
  Type as TypeIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PRESETS = [
  { id: 'hustle', label: 'Hustle LA (Candid Fake)', value: 'Candid Fake + Hustle + Downtown LA' },
  { id: 'studio', label: 'Dark Studio Minimal', value: 'Minimal + Dark + Studio' },
  { id: 'luxury', label: 'Luxury Collection', value: 'Maximalist + Luxury + Jewelry Table' },
  { id: 'aggressive', label: 'Aggressive Alley', value: 'Cinematic Text + Aggressive + Alley' },
  { id: 'emotional', label: 'Emotional Warped', value: 'Warped + Emotional + Close Face' },
];

const SCENE_SECTIONS = [
  {
    title: "High Priority",
    scenes: [
      "Hustle LA Night", "Luxury Benz Interior", "Dark Alley Smoke", "Studio Vibing Neon",
      "Rooftop Sunset LA", "Rainy Street Reflection", "Gold Chain Closeup", "Lowrider Cruise Sunset",
      "Neon Strip Walk", "Money Table Spread", "Downtown Lights Blur", "Silhouette Street Figure",
      "Parking Garage Shadows", "Vintage LA Vibe", "Palm Trees Night Sky", "Studio Headphones Focus",
      "Backseat Night Ride", "Gas Station Glow", "Late Night Grind", "City Overlook Alone",
      "Chrome Wheels Detail", "Street Corner Tension", "Foggy Night Walk", "Diamond Watch Glow",
      "Empty Freeway Night"
    ]
  },
  {
    title: "Emotional / Story Driven",
    scenes: [
      "Alone In The City", "Late Night Thinking", "Pain Behind Success", "No Sleep Hustle",
      "Cold World Energy", "Lost In LA", "Pressure Rising", "Silent Come Up", "Midnight Reflection",
      "Dreams vs Reality", "Built From Nothing", "Heavy Thoughts Night", "Isolation Grind",
      "Dark Mind State", "Nobody Believed", "Against The Odds", "Hunger Mode", "Tunnel Vision Focus",
      "No Days Off", "Street Survivor", "Internal War", "Calm Before Storm", "Lonely Success",
      "Time Running Out", "Shadow Self"
    ]
  },
  {
    title: "Luxury",
    scenes: [
      "Private Jet Mood", "Penthouse View Night", "Luxury Watch Close", "Designer Fit Walk",
      "VIP Club Scene", "Gold Everything", "High Roller Energy", "Rooftop Champagne", "Black Car Convoy",
      "Wealth Lifestyle", "Success Flex", "Top Floor Living", "Night Drive Exotic Car",
      "Diamond Drip Scene", "Luxury Office Setup", "Boss Energy Alone", "Executive Presence",
      "Clean Money Vibes", "Silent Millionaire", "Elite Status Mood", "Power Moves Only",
      "Big Deal Energy", "Winning Season", "Top Tier Lifestyle", "Level Up Complete"
    ]
  },
  {
    title: "Experimental / Viral Bait",
    scenes: [
      "Glitch Reality LA", "Two Versions Of Me", "Time Frozen Street", "Floating Above City",
      "Cloned Hustler Scene", "Reality Breaking Moment", "Dream State Walk", "Mirrored World",
      "Double Exposure Life", "Burning City Lights", "Surreal Night Vision", "Upside Down LA",
      "Distorted Identity", "Split Timeline Scene", "Neon Dreamscape", "AI World Takeover",
      "Shadow Moving Alone", "Ghost In The City", "Unknown Presence", "Breaking The Matrix",
      "Simulation Glitch", "Parallel Hustle", "Infinite Loop Scene", "Out Of Body Moment", "Reality Collapse"
    ]
  }
];

const CATEGORIES = ["Sonic Crossover", "Iconic Remix", "G-Funk", "Boom Bap"];

export default function App() {
  const [fastInput, setFastInput] = useState('');
  const [ultraInput, setUltraInput] = useState('');
  const [category, setCategory] = useState('G-Funk');
  const [thumbnailPrompt, setThumbnailPrompt] = useState('');
  const [batchOutput, setBatchOutput] = useState('');
  const [seoMetadata, setSeoMetadata] = useState<{
    title: string;
    description: string;
    hashtags: string;
    keywords: string;
    viralTitle: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  const getThumbnailScore = (input: string) => {
    let score = 0;
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("candid")) score += 25;
    if (lowerInput.includes("dark")) score += 15;
    if (lowerInput.includes("minimal")) score += 15;
    if (lowerInput.includes("luxury")) score += 10;
    if (lowerInput.includes("warp")) score += 20;
    if (lowerInput.includes("la")) score += 10;

    if (score >= 80) return { label: "🔥 VIRAL POTENTIAL", score, color: "text-gold" };
    if (score >= 60) return { label: "⚡ HIGH CTR", score, color: "text-green-400" };
    if (score >= 40) return { label: "👍 SOLID", score, color: "text-blue-400" };
    return { label: "⚠️ NEEDS WORK", score, color: "text-white/40" };
  };

  const currentScore = getThumbnailScore(fastInput || ultraInput);

  const generateViralTitle = () => {
    const titles = [
      "This Beat Should Be Illegal",
      "West Coast G-Funk Just Evolved",
      "You Haven’t Heard This Sound Before",
      "This Beat Is Too Smooth",
      "The Streets Needed This",
      "This One Feels Different",
      "LA Nights Hit Different",
      "This Beat Is Dangerous",
      "Too Clean To Ignore",
      "You’ll Replay This One"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const getCategoryStyle = (cat: string) => {
    if (cat === "Sonic Crossover") return "two worlds colliding, high contrast cinematic";
    if (cat === "Iconic Remix") return "split composition, battle energy";
    if (cat === "G-Funk") return "warm luxury cinematic LA style";
    if (cat === "Boom Bap") return "dark gritty realistic NYC style";
    return "";
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateBatch = () => {
    const input = fastInput || ultraInput;
    if (!input) return;

    const variations = [
      "Candid Fake", "Minimal", "Maximalist", "Warped", "Cinematic Text", "Dark Anti", "Luxury", "Aggressive", "Emotional", "Split Composition"
    ];

    let outputs = "";
    variations.forEach(style => {
      outputs += `STYLE: ${style}\n\nCreate a high CTR YouTube thumbnail for a ${category} instrumental.\n\nScene:\n${input}\n\nExecution:\n- Apply ${style} aesthetic\n- Cinematic lighting\n- Strong focal point\n- High contrast\n- Mobile-first clarity\n\nStyle Context: ${getCategoryStyle(category)}\n\nFinal Look:\n- Movie still quality\n- Clean, iconic\n\n\n\n`;
    });

    setBatchOutput(outputs);
    setActiveTab('batch');
  };

  const generateContent = async () => {
    const input = fastInput || ultraInput;
    if (!input) return;

    setIsGenerating(true);
    setActiveTab('single');
    try {
      const model = "gemini-3-flash-preview";
      
      // Generate Thumbnail Prompt
      const thumbResponse = await ai.models.generateContent({
        model,
        contents: `Create a high CTR YouTube thumbnail prompt for a ${category} instrumental.
        
        Scene: ${input}
        Style Context: ${getCategoryStyle(category)}
        
        Execution:
        - Cinematic lighting
        - Strong focal point
        - High contrast
        - Mobile-first clarity
        
        Psychology:
        - Strong curiosity gap
        - Scroll-stopping composition
        
        Final Look:
        - Movie still quality
        - Clean, iconic`,
      });
      setThumbnailPrompt(thumbResponse.text || '');

      // Generate SEO Metadata following strict constraints
      const seoResponse = await ai.models.generateContent({
        model,
        contents: `Generate SEO metadata for a ${category} music track based on: ${input}.
        Return a JSON object with:
        1) title: SEO-primed track title
        2) description: SEO-primed description
        3) hashtags: Hashtag block
        4) keywords: A comma-separated keyword bank that MUST be between 491 and 500 characters long.
        5) viralTitle: A short, punchy, curiosity-gap title (e.g., "This Beat Should Be Illegal")
        
        The keyword bank constraint is CRITICAL. It must be exactly 491-500 characters.`,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const seoData = JSON.parse(seoResponse.text || '{}');
      setSeoMetadata(seoData);

    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-gold selection:text-black">
      {/* Header */}
      <header className="border-b border-white/10 p-6 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.3)]">
            <Music className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter uppercase italic">Iconic Beats</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em]">Studio Engine v2.0</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider font-medium text-white/70">System Online</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-8">
          <section className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold/80">
                  <Zap size={14} />
                  Fast Input (Style + Mood + Scene)
                </label>
                {(fastInput || ultraInput) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-[10px] font-black uppercase tracking-tighter ${currentScore.color} bg-white/5 px-2 py-1 rounded border border-white/5`}
                  >
                    {currentScore.label} ({currentScore.score})
                  </motion.div>
                )}
              </div>
              <div className="relative group">
                <input 
                  value={fastInput}
                  onChange={(e) => setFastInput(e.target.value)}
                  placeholder="Example: Candid Fake + Hustle + LA Night"
                  className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-gold/50 transition-all group-hover:border-white/20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold/80">
                <Layout size={14} />
                Category
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-gold/50 transition-all appearance-none cursor-pointer hover:border-white/20"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold/80">
                <Sparkles size={14} />
                Ultra Fast (1–2 Words)
              </label>
              <input 
                value={ultraInput}
                onChange={(e) => setUltraInput(e.target.value)}
                placeholder="Example: Hustle LA"
                className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={generateContent}
                disabled={isGenerating || (!fastInput && !ultraInput)}
                className="w-full bg-gold hover:bg-[#FFD700]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-tighter text-lg shadow-[0_10px_30px_rgba(255,215,0,0.1)] active:scale-[0.98]"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <>
                    AI Generation
                    <ChevronRight size={20} />
                  </>
                )}
              </button>

              <button 
                onClick={generateBatch}
                disabled={isGenerating || (!fastInput && !ultraInput)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs active:scale-[0.98]"
              >
                <Layout size={16} />
                Generate 10 Variations
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-2">Quick Presets</h3>
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setFastInput(preset.value);
                    setUltraInput('');
                  }}
                  className="text-left p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-gold/30 transition-all group flex justify-between items-center"
                >
                  <span className="text-xs font-medium text-white/80 group-hover:text-white">{preset.label}</span>
                  <Layout size={12} className="text-white/20 group-hover:text-gold/50" />
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-2">Scene Library</h3>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {SCENE_SECTIONS.map((section, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase tracking-tighter text-gold/60 px-2">{section.title}</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {section.scenes.map((scene, index) => (
                      <button
                        key={index}
                        onClick={() => setUltraInput(scene)}
                        className="text-left p-2 rounded hover:bg-white/5 text-[10px] text-white/50 hover:text-gold transition-all truncate"
                      >
                        {scene}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-8 space-y-8">
          {/* Tabs */}
          {(thumbnailPrompt || batchOutput) && (
            <div className="flex gap-4 border-b border-white/10">
              <button 
                onClick={() => setActiveTab('single')}
                className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'single' ? 'text-gold' : 'text-white/40 hover:text-white'}`}
              >
                Single Asset
                {activeTab === 'single' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
              </button>
              <button 
                onClick={() => setActiveTab('batch')}
                className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'batch' ? 'text-gold' : 'text-white/40 hover:text-white'}`}
              >
                Batch Variations
                {activeTab === 'batch' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'single' && (thumbnailPrompt || seoMetadata) ? (
              <motion.div 
                key="single"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Thumbnail Section */}
                <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-2">
                      <Camera size={16} className="text-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Thumbnail Prompt</span>
                    </div>
                    <button 
                      onClick={() => handleCopy(thumbnailPrompt, 'thumb')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-[10px] uppercase font-bold"
                    >
                      {copiedField === 'thumb' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      {copiedField === 'thumb' ? 'Copied' : 'Copy Prompt'}
                    </button>
                  </div>
                  <div className="p-6">
                    <pre className="text-sm text-white/70 whitespace-pre-wrap font-mono leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5">
                      {thumbnailPrompt}
                    </pre>
                  </div>
                </div>

                {/* SEO Section */}
                {seoMetadata && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Viral Title & Track Title */}
                    <div className="space-y-6 md:col-span-2">
                      <div className="bg-[#111] rounded-2xl border border-white/10 p-6 space-y-4 border-l-4 border-l-gold">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Suggested Title</span>
                          </div>
                          <button onClick={() => handleCopy(seoMetadata.viralTitle, 'viral')} className="text-white/40 hover:text-white transition-colors">
                            {copiedField === 'viral' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-xl font-black tracking-tight italic uppercase">{seoMetadata.viralTitle}</p>
                      </div>

                      <div className="bg-[#111] rounded-2xl border border-white/10 p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <TypeIcon size={16} className="text-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">SEO Track Title</span>
                          </div>
                          <button onClick={() => handleCopy(seoMetadata.title, 'title')} className="text-white/40 hover:text-white transition-colors">
                            {copiedField === 'title' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-lg font-bold tracking-tight">{seoMetadata.title}</p>
                      </div>

                      <div className="bg-[#111] rounded-2xl border border-white/10 p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Layout size={16} className="text-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">SEO Description</span>
                          </div>
                          <button onClick={() => handleCopy(seoMetadata.description, 'desc')} className="text-white/40 hover:text-white transition-colors">
                            {copiedField === 'desc' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{seoMetadata.description}</p>
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div className="bg-[#111] rounded-2xl border border-white/10 p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Hash size={16} className="text-gold" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Hashtags</span>
                        </div>
                        <button onClick={() => handleCopy(seoMetadata.hashtags, 'hash')} className="text-white/40 hover:text-white transition-colors">
                          {copiedField === 'hash' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="text-xs text-gold/80 font-mono">{seoMetadata.hashtags}</p>
                    </div>

                    {/* Keywords */}
                    <div className="bg-[#111] rounded-2xl border border-white/10 p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Search size={16} className="text-gold" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Keyword Bank</span>
                        </div>
                        <button onClick={() => handleCopy(seoMetadata.keywords, 'keys')} className="text-white/40 hover:text-white transition-colors">
                          {copiedField === 'keys' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-white/40 font-mono break-all leading-tight">
                        {seoMetadata.keywords}
                      </p>
                      <div className="flex justify-end">
                        <span className="text-[9px] text-white/20 uppercase tracking-widest">
                          Chars: {seoMetadata.keywords.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'batch' && batchOutput ? (
              <motion.div 
                key="batch"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
              >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div className="flex items-center gap-2">
                    <Layout size={16} className="text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Batch Variations (10 Styles)</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(batchOutput, 'batch')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-[10px] uppercase font-bold"
                  >
                    {copiedField === 'batch' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    {copiedField === 'batch' ? 'Copied All' : 'Copy All'}
                  </button>
                </div>
                <div className="p-6">
                  <textarea 
                    readOnly
                    value={batchOutput}
                    className="w-full h-[600px] bg-black/30 p-6 rounded-xl border border-white/5 text-xs text-white/70 font-mono leading-relaxed focus:outline-none resize-none"
                  />
                </div>
              </motion.div>
            ) : (
              <div className="h-[600px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-white/20 space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                  <Zap size={40} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold uppercase tracking-widest">Awaiting Input</p>
                  <p className="text-xs">Enter a style or mood to generate assets</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
        <div className="flex items-center gap-2">
          <Music size={14} />
          <span className="text-[10px] uppercase tracking-widest font-bold">Iconic Beats Studio Engine</span>
        </div>
        <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold">
          <a href="#" className="hover:text-gold transition-colors">Documentation</a>
          <a href="#" className="hover:text-gold transition-colors">API Status</a>
          <a href="#" className="hover:text-gold transition-colors">Privacy</a>
        </div>
        <p className="text-[10px] uppercase tracking-widest">© 2026 Santiago Green</p>
      </footer>
    </div>
  );
}
