import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useEmails } from '../src/hooks/useData';
import { emailsService } from '../src/services/emails';
import { Email, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';
import { Navigate } from 'react-router-dom';
import { getAIClient } from '../services/aiService';
import { 
    Search, 
    Inbox as InboxIcon, 
    Archive, 
    Trash2, 
    Sparkles, 
    ArrowRight,
    Calendar,
    ChevronLeft,
    Mail,
    FileText,
    Plus,
    X,
    Clock,
    Tag,
    Hash,
    Loader2,
    CheckCircle,
    Send
} from 'lucide-react';

export const Inbox: React.FC = () => {
    const { role, user } = useAuth();
    const { data: loadedEmails } = useEmails(user?.tenantId);
    const { isAIEnabled } = useSecurity();
    
    // --- STATE ---
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [localEmails, setLocalEmails] = useState<Email[]>([]);
    useEffect(() => { setLocalEmails(loadedEmails); }, [loadedEmails]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'INBOX' | 'SNOOZED' | 'ARCHIVE'>('INBOX');
    const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
    
    // Interaction States
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    
    // UI States for Popovers
    const [tagInputOpen, setTagInputOpen] = useState(false);
    const [newTagText, setNewTagText] = useState('');
    const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(false);

    if (role === UserRole.CLIENT) {
        return <Navigate to="/dashboard" />;
    }

    // --- DERIVED STATE ---

    // 1. Calculate unique tags dynamically from current email state
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        localEmails.forEach(email => {
            email.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [localEmails]);

    // 2. Filter Emails based on Search, Tab, OR Tag
    const filteredEmails = localEmails.filter(email => {
        const matchesSearch = email.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              email.content.toLowerCase().includes(searchTerm.toLowerCase());
        
        // If a Tag Filter is active, ignore the Folder Tabs (Inbox/Archive) 
        // This mimics Gmail behavior (Clicking a Label shows all emails with that label)
        if (activeTagFilter) {
            return matchesSearch && email.tags?.includes(activeTagFilter);
        }

        // Standard Folder Filtering
        let matchesFolder = false;
        if (activeTab === 'INBOX') {
            // Inbox shows unread/read emails that are NOT archived and NOT snoozed
            matchesFolder = email.folder === 'INBOX' && (!email.snoozedUntil || new Date(email.snoozedUntil) <= new Date());
        } else if (activeTab === 'ARCHIVE') {
            matchesFolder = email.folder === 'ARCHIVE';
        } else if (activeTab === 'SNOOZED') {
            matchesFolder = email.snoozedUntil !== undefined && email.snoozedUntil !== null && new Date(email.snoozedUntil) > new Date();
        }

        return matchesSearch && matchesFolder;
    });

    // --- HANDLERS ---

    const handleEmailClick = (email: Email) => {
        // Mark as read immediately
        const updatedEmails = localEmails.map(e => e.id === email.id ? { ...e, isRead: true } : e);
        setLocalEmails(updatedEmails);
        setSelectedEmail({ ...email, isRead: true });
        setAiSummary(null);
        setTagInputOpen(false);
        if (!email.isRead) emailsService.update(email.id, { isRead: true });
    };

    const handleArchive = (e: React.MouseEvent, email: Email) => {
        e.stopPropagation();
        setLocalEmails(prev => prev.map(em => em.id === email.id ? { ...em, folder: 'ARCHIVE' } : em));
        if (selectedEmail?.id === email.id) setSelectedEmail(null);
        emailsService.update(email.id, { folder: 'ARCHIVE' });
    };

    const handleSnooze = (days: number) => {
        if (!selectedEmail) return;
        const snoozeDate = new Date();
        snoozeDate.setDate(snoozeDate.getDate() + days);

        setLocalEmails(prev => prev.map(em => em.id === selectedEmail.id ? { ...em, snoozedUntil: snoozeDate, folder: 'INBOX' } : em));
        emailsService.update(selectedEmail.id, { snoozedUntil: snoozeDate, folder: 'INBOX' });
        setSelectedEmail(null);
        setSnoozeMenuOpen(false);
    };

    const handleAddTag = () => {
        if (!selectedEmail || !newTagText.trim()) return;
        
        const tagToAdd = newTagText.trim();
        
        // Update local state
        const updatedEmails = localEmails.map(em => {
            if (em.id === selectedEmail.id) {
                const currentTags = em.tags || [];
                if (!currentTags.includes(tagToAdd)) {
                    return { ...em, tags: [...currentTags, tagToAdd] };
                }
            }
            return em;
        });

        setLocalEmails(updatedEmails);
        
        // Update selected email view
        const updatedSelected = updatedEmails.find(e => e.id === selectedEmail.id);
        if (updatedSelected) {
            setSelectedEmail(updatedSelected);
            emailsService.update(updatedSelected.id, { tags: updatedSelected.tags });
        }

        setNewTagText('');
        setTagInputOpen(false);
    };

    const handleRemoveTag = (tagToRemove: string) => {
        if (!selectedEmail) return;

        const updatedEmails = localEmails.map(em => {
            if (em.id === selectedEmail.id) {
                return { ...em, tags: em.tags?.filter(t => t !== tagToRemove) };
            }
            return em;
        });

        setLocalEmails(updatedEmails);
        
        const updatedSelected = updatedEmails.find(e => e.id === selectedEmail.id);
        if (updatedSelected) setSelectedEmail(updatedSelected);
    };

    const handleAiAnalysis = async () => {
        if (!selectedEmail) return;
        setIsGeneratingAi(true);
        
        try {
            const ai = getAIClient();
            const prompt = `
                Analysiere diese E-Mail für einen Versicherungsbroker.
                Email Inhalt: "${selectedEmail.content.replace(/<[^>]*>?/gm, '')}"
                
                Gib mir folgendes im JSON Format zurück:
                {
                    "summary": "Zusammenfassung in 1-2 Sätzen auf Deutsch",
                    "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
                    "actionItems": ["Handlungsschritt 1", "Handlungsschritt 2"]
                }
            `;

            const result = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            
            const text = result.text;
            if (text) {
                const data = JSON.parse(text);
                setAiSummary(`**Zusammenfassung:** ${data.summary}\n\n**Vorschläge:**\n${data.actionItems.map((i: string) => `- ${i}`).join('\n')}`);
            }
        } catch (e) {
            console.error(e);
            setAiSummary("Konnte Analyse nicht durchführen.");
        } finally {
            setIsGeneratingAi(false);
        }
    };

    return (
        <Layout>
            <div className="flex h-[calc(100vh-100px)] -mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                
                {/* LEFT SIDEBAR (Folders & Tags) */}
                <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col">
                    <div className="p-4">
                        <Button className="w-full justify-start gap-2" icon={<Plus size={18}/>}>Neue Email</Button>
                    </div>
                    
                    <div className="space-y-1 px-2">
                        <NavButton 
                            active={activeTab === 'INBOX' && !activeTagFilter} 
                            onClick={() => { setActiveTab('INBOX'); setActiveTagFilter(null); }} 
                            icon={<InboxIcon size={18}/>} 
                            label="Posteingang" 
                            count={localEmails.filter(e => e.folder === 'INBOX' && !e.isRead && (!e.snoozedUntil || new Date(e.snoozedUntil) <= new Date())).length} 
                        />
                        <NavButton 
                            active={activeTab === 'SNOOZED' && !activeTagFilter} 
                            onClick={() => { setActiveTab('SNOOZED'); setActiveTagFilter(null); }} 
                            icon={<Clock size={18}/>} 
                            label="Zurückgestellt" 
                        />
                        <NavButton 
                            active={activeTab === 'ARCHIVE' && !activeTagFilter} 
                            onClick={() => { setActiveTab('ARCHIVE'); setActiveTagFilter(null); }} 
                            icon={<Archive size={18}/>} 
                            label="Archiv" 
                        />
                    </div>

                    <div className="mt-8 px-4">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                            <span>Tags</span>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 rounded-full">{allTags.length}</span>
                        </div>
                        <div className="space-y-1">
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors group ${
                                        activeTagFilter === tag 
                                        ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Hash size={14} className={activeTagFilter === tag ? 'text-brand-600' : 'text-slate-400'} />
                                        <span className="truncate">{tag}</span>
                                    </div>
                                    {activeTagFilter === tag && (
                                        <X size={14} className="opacity-50 hover:opacity-100" onClick={(e) => { e.stopPropagation(); setActiveTagFilter(null); }} />
                                    )}
                                </button>
                            ))}
                            {allTags.length === 0 && (
                                <p className="text-xs text-slate-400 italic px-2">Keine Tags vorhanden.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* MIDDLE COLUMN (Email List) */}
                <div className={`${selectedEmail ? 'hidden lg:block' : 'block'} w-full lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900`}>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Suchen..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        {activeTagFilter && (
                            <div className="mt-2 flex items-center justify-between bg-brand-50 dark:bg-brand-900/10 px-3 py-1.5 rounded text-xs text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900/30">
                                <span className="font-medium flex items-center gap-1"><Tag size={12}/> Filter: {activeTagFilter}</span>
                                <button onClick={() => setActiveTagFilter(null)} className="hover:text-brand-900"><X size={12}/></button>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {filteredEmails.map(email => (
                            <div 
                                key={email.id}
                                onClick={() => handleEmailClick(email)}
                                className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                    selectedEmail?.id === email.id ? 'bg-brand-50 dark:bg-brand-900/10 border-l-4 border-l-brand-500' : 'border-l-4 border-l-transparent'
                                } ${!email.isRead ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm ${!email.isRead ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                        {email.senderName}
                                    </h4>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                        {email.date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })}
                                    </span>
                                </div>
                                <p className={`text-sm mb-1 truncate ${!email.isRead ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {email.subject}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2">
                                    {email.preview}
                                </p>
                                
                                {/* Tags in List View */}
                                {email.tags && email.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {email.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] rounded border border-slate-200 dark:border-slate-700">
                                                {tag}
                                            </span>
                                        ))}
                                        {email.tags.length > 3 && <span className="text-[10px] text-slate-400">+{email.tags.length - 3}</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                        {filteredEmails.length === 0 && (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                Keine Emails gefunden.
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN (Detail View) */}
                <div className={`${!selectedEmail ? 'hidden lg:flex' : 'flex'} flex-1 flex-col bg-white dark:bg-slate-900`}>
                    {selectedEmail ? (
                        <>
                            {/* Toolbar */}
                            <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setSelectedEmail(null)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={(e) => handleArchive(e, selectedEmail)} className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Archivieren">
                                        <Archive size={18} />
                                    </button>
                                    <button className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Löschen">
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                    
                                    {/* Snooze Dropdown */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setSnoozeMenuOpen(!snoozeMenuOpen)}
                                            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 ${snoozeMenuOpen ? 'bg-slate-100 dark:bg-slate-800 text-brand-600' : 'text-slate-500'}`}
                                            title="Zurückstellen"
                                        >
                                            <Clock size={18} />
                                        </button>
                                        {snoozeMenuOpen && (
                                            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 py-1">
                                                <button onClick={() => handleSnooze(1)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex justify-between">
                                                    <span>Morgen</span>
                                                    <span className="text-slate-400 text-xs">08:00</span>
                                                </button>
                                                <button onClick={() => handleSnooze(7)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex justify-between">
                                                    <span>Nächste Woche</span>
                                                    <span className="text-slate-400 text-xs">Mo.</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Tag Popover */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setTagInputOpen(!tagInputOpen)}
                                            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg ${tagInputOpen ? 'bg-slate-100 dark:bg-slate-800 text-brand-600' : 'text-slate-500'}`}
                                            title="Tag hinzufügen"
                                        >
                                            <Tag size={18} />
                                        </button>
                                        {tagInputOpen && (
                                            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 p-3">
                                                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Neuer Tag</p>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={newTagText}
                                                        onChange={(e) => setNewTagText(e.target.value)}
                                                        className="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-700 rounded bg-transparent focus:ring-1 focus:ring-brand-500"
                                                        placeholder="Name..."
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                                    />
                                                    <Button size="sm" onClick={handleAddTag} disabled={!newTagText.trim()}>Add</Button>
                                                </div>
                                                {/* Quick Select Existing */}
                                                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                                                    <p className="text-xs text-slate-400 mb-1">Vorhandene Tags:</p>
                                                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                                        {allTags.filter(t => !selectedEmail.tags?.includes(t)).map(tag => (
                                                            <button 
                                                                key={tag}
                                                                onClick={() => { setNewTagText(tag); handleAddTag(); }}
                                                                className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                                                            >
                                                                {tag}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isAIEnabled && (
                                        <Button 
                                            size="sm" 
                                            variant="secondary" 
                                            className="text-purple-600 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 border-purple-100 dark:border-purple-900/30"
                                            icon={<Sparkles size={16} />}
                                            onClick={handleAiAnalysis}
                                            disabled={isGeneratingAi}
                                        >
                                            Smart Analysis
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Email Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="max-w-3xl mx-auto">
                                    
                                    {/* Subject & Tags */}
                                    <div className="mb-6">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            {selectedEmail.tags?.map(tag => (
                                                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group">
                                                    {tag}
                                                    <button 
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                            {selectedEmail.category === 'CLAIMS' && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Schadenfall</span>}
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedEmail.subject}</h2>
                                    </div>

                                    {/* AI Summary Block */}
                                    {isGeneratingAi ? (
                                        <div className="mb-8 p-4 bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/30 rounded-xl shadow-sm animate-pulse">
                                            <div className="flex items-center gap-2 text-purple-600 text-sm font-bold mb-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                KI analysiert Inhalt...
                                            </div>
                                            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/2"></div>
                                        </div>
                                    ) : aiSummary ? (
                                        <div className="mb-8 p-6 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-800/50 border border-purple-100 dark:border-purple-900/30 rounded-xl shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                                <Sparkles size={60} className="text-purple-600" />
                                            </div>
                                            <h3 className="text-sm font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2 mb-3">
                                                <Sparkles size={16} /> Gemini Analysis
                                            </h3>
                                            <div className="prose dark:prose-invert prose-sm text-slate-700 dark:text-slate-300">
                                                <div dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br/>') }} />
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Sender Info */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                                                {selectedEmail.senderName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-slate-100">{selectedEmail.senderName}</p>
                                                <p className="text-sm text-slate-500">{selectedEmail.senderEmail}</p>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-slate-500">
                                            {selectedEmail.date.toLocaleString('de-CH')}
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div 
                                        className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200"
                                        dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                                    />

                                    {/* Attachments */}
                                    {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                                                <FileText size={16} /> Anhänge ({selectedEmail.attachments.length})
                                            </h4>
                                            <div className="flex flex-wrap gap-4">
                                                {selectedEmail.attachments.map((att, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors bg-white dark:bg-slate-900/50">
                                                        <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{att.name}</p>
                                                            <p className="text-xs text-slate-500 uppercase">{att.type.split('/')[1]}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Context Actions */}
                                    <div className="mt-12 flex gap-4">
                                        <Button icon={<ArrowRight size={16} />}>Antworten</Button>
                                        <Button variant="outline">Weiterleiten</Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <InboxIcon size={48} className="opacity-50" />
                            </div>
                            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Wählen Sie eine Nachricht aus</p>
                            <p className="text-sm max-w-xs text-center mt-2">
                                Klicken Sie links auf eine E-Mail, um den Inhalt anzuzeigen oder nutzen Sie die Suche.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

const NavButton = ({ active, onClick, icon, label, count }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
            active 
            ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-sm' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
    >
        <div className="flex items-center gap-3">
            {icon}
            {label}
        </div>
        {count > 0 && (
            <span className="bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {count}
            </span>
        )}
    </button>
);
