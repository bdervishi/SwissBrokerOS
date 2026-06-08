import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from '../components/ui/Accordion';
import { FAQS as DEFAULT_FAQS } from '../constants';
import { BackToTop } from '../components/ui/BackToTop';
import { PublicNavigation } from '../components/PublicNavigation';
import { 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  ArrowLeft,
  MessageSquare,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { getAIClient } from '../services/aiService';

export const FAQPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Alle");
  const [feedback, setFeedback] = useState<{ [q: string]: "up" | "down" | undefined }>({});
  const [showFeedbackInput, setShowFeedbackInput] = useState<{ [q: string]: boolean }>({});
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  
  // Load FAQS from localStorage (dynamic) or constants (static fallback)
  const [faqs, setFaqs] = useState<{category: string, question: string, answer: string}[]>(DEFAULT_FAQS);

  useEffect(() => {
    // Dynamic FAQ Load from SaaS Admin
    const storedFaqs = localStorage.getItem('app_faqs');
    if (storedFaqs) {
        setFaqs(JSON.parse(storedFaqs));
    }
  }, []);

  const categories = useMemo(() => ["Alle", ...Array.from(new Set(faqs.map(f => f.category)))], [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) || 
                            faq.answer.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "Alle" || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, faqs]);

  const handleFeedback = (q: string, type: "up" | "down") => {
    setFeedback(fb => ({ ...fb, [q]: type }));
    if (type === "down") setShowFeedbackInput(fb => ({ ...fb, [q]: true }));
  };

  const handleAiAsk = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse("");

    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Du bist der Support-Assistent von SwissBroker OS. Beantworte die folgende Frage kurz und präzise auf Deutsch: "${aiInput}". Falls die Frage nichts mit SwissBroker OS, Versicherungen oder Finanzierung zu tun hat, weise höflich darauf hin.`
      });
      setAiResponse(response.text || "Entschuldigung, ich konnte keine Antwort generieren.");
    } catch (e) {
      setAiResponse("Leider gab es ein technisches Problem bei der KI-Anfrage. Bitte kontaktieren Sie unseren Support.");
    } finally {
      setAiLoading(false);
    }
  };

  const personalizedSuggestions = useMemo(() => 
    [...faqs].sort(() => 0.5 - Math.random()).slice(0, 3)
  , [faqs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans">
      <BackToTop />
      <PublicNavigation />

      <main className="pb-20 px-4 pt-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:hover:text-white transition-colors mb-12 font-medium">
            <ArrowLeft size={16} /> Zurück zur Startseite
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Häufige Fragen (FAQ)</h1>
            <p className="text-slate-500 dark:text-slate-400">Finden Sie schnelle Antworten oder fragen Sie unsere KI.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Main Content: Search & Accordion */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Themen oder Keywords suchen..." 
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none shadow-sm transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Category Chips */}
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      activeCategory === cat 
                      ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/20' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <Card className="p-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <Accordion type="single" collapsible className="w-full px-4">
                  {filteredFaqs.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                      <HelpCircle size={40} className="mx-auto mb-3 opacity-20" />
                      <p>Keine passenden Fragen gefunden.</p>
                    </div>
                  ) : (
                    filteredFaqs.map((faq, idx) => (
                      <AccordionItem key={idx} value={faq.question}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <p className="leading-relaxed">{faq.answer}</p>
                            <div className="flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                              <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Hilfreich?</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleFeedback(faq.question, 'up')}
                                  className={`p-1.5 rounded-lg transition-colors ${feedback[faq.question] === 'up' ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
                                >
                                  <ThumbsUp size={16} />
                                </button>
                                <button 
                                  onClick={() => handleFeedback(faq.question, 'down')}
                                  className={`p-1.5 rounded-lg transition-colors ${feedback[faq.question] === 'down' ? 'bg-red-100 text-red-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
                                >
                                  <ThumbsDown size={16} />
                                </button>
                              </div>
                              {feedback[faq.question] === 'up' && <span className="text-emerald-500 text-[10px] font-bold animate-in fade-in">Danke!</span>}
                            </div>
                            {showFeedbackInput[faq.question] && (
                               <div className="space-y-2 animate-in slide-in-from-top-2">
                                  <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-brand-500" placeholder="Wie können wir diese Antwort verbessern?" rows={2} />
                                  <Button size="sm" onClick={() => setShowFeedbackInput({...showFeedbackInput, [faq.question]: false})}>Feedback senden</Button>
                               </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))
                  )}
                </Accordion>
              </Card>
            </div>

            {/* Sidebar: AI Assistant & Suggestions */}
            <div className="space-y-6">
              <Card className="p-6 border-purple-200 dark:border-purple-900/30 bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-slate-900/50 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles size={80} className="text-purple-600" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Sparkles size={18} />
                    KI Support Assistent
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">Keine passende Antwort gefunden? Fragen Sie unsere KI nach spezifischen Details.</p>
                  
                  <div className="space-y-4">
                    <textarea 
                      className="w-full p-4 bg-white dark:bg-slate-950 border border-purple-100 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] shadow-inner transition-all"
                      placeholder="Ihre Frage hier..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                    />
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 border-none shadow-lg shadow-purple-500/20"
                      onClick={handleAiAsk}
                      disabled={aiLoading || !aiInput.trim()}
                      icon={aiLoading ? <Loader2 className="animate-spin" size={18}/> : <MessageSquare size={18}/>}
                    >
                      {aiLoading ? 'KI überlegt...' : 'KI fragen'}
                    </Button>

                    {aiResponse && (
                      <div className="p-4 bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-xl text-sm animate-in zoom-in-95 duration-300 shadow-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        <div className="text-xs font-black uppercase text-purple-500 mb-2 tracking-widest flex items-center gap-2">
                           <Sparkles size={12} /> Antwort
                        </div>
                        {aiResponse}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <div className="p-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Das könnte Sie auch interessieren:</h4>
                <ul className="space-y-4">
                  {personalizedSuggestions.map((faq, i) => (
                    <li key={i} className="group">
                      <button 
                        onClick={() => { setSearch(faq.question); setActiveCategory("Alle"); }}
                        className="text-left text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition-colors flex items-start gap-2"
                      >
                        <ChevronRight className="h-4 w-4 mt-0.5 text-slate-300 group-hover:text-brand-500" />
                        {faq.question}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          <div className="mt-20 p-12 bg-slate-900 rounded-[2.5rem] text-center text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Noch Fragen offen?</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">Unser Experten-Team steht Ihnen persönlich zur Verfügung.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="primary" className="px-8 bg-white text-slate-950 hover:bg-slate-100 border-none font-black uppercase tracking-widest text-xs">Support kontaktieren</Button>
                  <Button variant="outline" className="px-8 border-slate-700 text-white hover:bg-slate-800 font-black uppercase tracking-widest text-xs">Live Chat</Button>
                </div>
              </div>
              <HelpCircle className="absolute -right-12 -bottom-12 w-64 h-64 text-white opacity-5" />
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
        &copy; {new Date().getFullYear()} SwissBroker OS. Alle Rechte vorbehalten.
      </footer>
    </div>
  );
};

const ChevronRight = ({ className, size = 20 }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);