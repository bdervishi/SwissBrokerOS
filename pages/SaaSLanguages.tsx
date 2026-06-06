import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useLanguage, LanguageDefinition } from '../contexts/LanguageContext';
import { Modal } from '../components/ui/Modal';
import { Plus, Trash2, Edit, Save, Globe, Check, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const SaaSLanguages: React.FC = () => {
    const { role } = useAuth();
    const { availableLanguages, addLanguage, updateTranslation, deleteLanguage, t } = useLanguage();
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // New Language Form
    const [newLangCode, setNewLangCode] = useState('');
    const [newLangLabel, setNewLangLabel] = useState('');

    // Editing State
    const [editingLang, setEditingLang] = useState<LanguageDefinition | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_FINANCE && role !== UserRole.SAAS_SALES) {
        return <Navigate to="/dashboard" />;
    }

    const handleAddLanguage = () => {
        if (newLangCode && newLangLabel) {
            addLanguage(newLangCode.toLowerCase(), newLangLabel);
            setNewLangCode('');
            setNewLangLabel('');
            setIsAddModalOpen(false);
        }
    };

    const handleOpenEdit = (lang: LanguageDefinition) => {
        setEditingLang(lang);
        setIsEditModalOpen(true);
    };

    const handleUpdateKey = (key: string, value: string) => {
        if (editingLang) {
            updateTranslation(editingLang.code, key, value);
            // Update local state to show changes immediately in modal
            setEditingLang(prev => prev ? ({
                ...prev,
                translations: {
                    ...prev.translations,
                    [key]: value
                }
            }) : null);
        }
    };

    // Filter keys for editor
    const getFilteredKeys = () => {
        if (!editingLang) return [];
        return Object.keys(editingLang.translations).filter(k => 
            k.toLowerCase().includes(searchTerm.toLowerCase()) || 
            editingLang.translations[k].toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sprachen & Lokalisierung</h1>
                    <p className="text-slate-500 text-sm">Verwalten Sie verfügbare Sprachen für die Plattform.</p>
                </div>
                <Button icon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>Neue Sprache</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableLanguages.map((lang) => (
                    <div key={lang.code} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg flex items-center justify-center font-bold uppercase text-sm">
                                    {lang.code}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{lang.label}</h3>
                                    <p className="text-xs text-slate-500">{Object.keys(lang.translations).length} Keys</p>
                                </div>
                            </div>
                            {lang.isSystem ? (
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-2 py-1 rounded">System</span>
                            ) : (
                                <button 
                                    onClick={() => deleteLanguage(lang.code)}
                                    className="text-red-400 hover:text-red-600 p-1"
                                    title="Löschen"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                        
                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-sm py-1 border-b border-slate-50 dark:border-slate-800">
                                <span className="text-slate-500">Dashboard</span>
                                <span className="text-slate-900 dark:text-slate-100">{lang.translations['nav.dashboard']}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1 border-b border-slate-50 dark:border-slate-800">
                                <span className="text-slate-500">Policen</span>
                                <span className="text-slate-900 dark:text-slate-100">{lang.translations['nav.policies']}</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button variant="outline" className="w-full" icon={<Edit size={16} />} onClick={() => handleOpenEdit(lang)}>
                                Übersetzungen bearbeiten
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Neue Sprache hinzufügen"
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                        <Globe size={20} className="shrink-0" />
                        <p>Die neue Sprache wird initial mit englischen Texten vorausgefüllt (Fallback).</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ISO Code (2-stellig)</label>
                        <input 
                            type="text" 
                            placeholder="z.B. es, pt, ru" 
                            maxLength={2}
                            value={newLangCode}
                            onChange={(e) => setNewLangCode(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Anzeigename</label>
                        <input 
                            type="text" 
                            placeholder="z.B. Espangol" 
                            value={newLangLabel}
                            onChange={(e) => setNewLangLabel(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Abbrechen</Button>
                        <Button onClick={handleAddLanguage} disabled={!newLangCode || !newLangLabel}>Hinzufügen</Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Übersetzen: ${editingLang?.label} (${editingLang?.code})`}
                maxWidth="max-w-4xl"
            >
                <div className="flex flex-col h-[70vh]">
                    <div className="mb-4">
                        <input 
                            type="text" 
                            placeholder="Keys durchsuchen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 font-medium text-slate-500 border-b border-slate-200 dark:border-slate-700">Key</th>
                                    <th className="p-3 font-medium text-slate-500 border-b border-slate-200 dark:border-slate-700">Übersetzung</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {getFilteredKeys().map(key => (
                                    <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                        <td className="p-3 font-mono text-xs text-slate-500 w-1/3">{key}</td>
                                        <td className="p-3">
                                            <input 
                                                type="text" 
                                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 dark:text-slate-100"
                                                value={editingLang?.translations[key] || ''}
                                                onChange={(e) => handleUpdateKey(key, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                        <Button onClick={() => setIsEditModalOpen(false)} icon={<Check size={16}/>}>Fertig</Button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};