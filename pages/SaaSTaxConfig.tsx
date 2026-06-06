import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import { Settings, Save, RefreshCw, Plus, Trash2, Map } from 'lucide-react';

// Mock Configuration Data
const INITIAL_TAX_FACTORS = [
    { id: 1, canton: 'Zürich', multiplier: 1.00, isActive: true },
    { id: 2, canton: 'Bern', multiplier: 1.25, isActive: true },
    { id: 3, canton: 'Luzern', multiplier: 0.75, isActive: true },
    { id: 4, canton: 'Zug', multiplier: 0.60, isActive: true },
    { id: 5, canton: 'Schwyz', multiplier: 0.65, isActive: true },
    { id: 6, canton: 'Aargau', multiplier: 0.95, isActive: true },
    { id: 7, canton: 'Genf', multiplier: 1.10, isActive: false },
];

const INITIAL_TAX_YEARS = [2022, 2023, 2024];

export const SaaSTaxConfig: React.FC = () => {
    const { role } = useAuth();
    
    const [factors, setFactors] = useState(INITIAL_TAX_FACTORS);
    const [years, setYears] = useState(INITIAL_TAX_YEARS);
    
    // Form States
    const [newYear, setNewYear] = useState<number>(2025);
    const [newCantonName, setNewCantonName] = useState('');
    const [newCantonFactor, setNewCantonFactor] = useState(1.0);
    
    const [isSaving, setIsSaving] = useState(false);

    // Access Control: Only SaaS Admins
    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_FINANCE) {
        return <Navigate to="/dashboard" />;
    }

    const handleFactorChange = (id: number, val: number) => {
        setFactors(prev => prev.map(f => f.id === id ? { ...f, multiplier: val } : f));
    };

    const toggleCanton = (id: number) => {
        setFactors(prev => prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
    };

    const handleAddCanton = () => {
        if (!newCantonName.trim()) return;
        
        const newId = factors.length > 0 ? Math.max(...factors.map(f => f.id)) + 1 : 1;
        setFactors(prev => [...prev, {
            id: newId,
            canton: newCantonName,
            multiplier: newCantonFactor,
            isActive: true
        }]);
        
        // Reset Form
        setNewCantonName('');
        setNewCantonFactor(1.0);
    };

    const handleDeleteCanton = (id: number) => {
        setFactors(prev => prev.filter(f => f.id !== id));
    };

    const addYear = () => {
        if (!years.includes(newYear)) {
            setYears(prev => [...prev, newYear].sort());
        }
    };

    const removeYear = (year: number) => {
        setYears(prev => prev.filter(y => y !== year));
    }

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            console.log("Tax config saved:", { factors, years });
        }, 1000);
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Settings className="text-brand-600" />
                        Steuer-Engine Konfiguration
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Globale Einstellungen für das Steuer-Cockpit und den Simulator.</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    icon={isSaving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18} />}
                    disabled={isSaving}
                >
                    {isSaving ? 'Speichere...' : 'Änderungen publizieren'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Canton Factors */}
                <Card title="Kantonale Multiplikatoren (Simulator)">
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-800 dark:text-blue-300 rounded-lg flex gap-3">
                        <Map size={20} className="shrink-0" />
                        <p>Diese Faktoren beeinflussen die Berechnung im "Relocation Simulator". <br/>Basiswert (1.0) = Referenzindex Zürich.</p>
                    </div>
                    
                    <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg mb-4">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Kanton</th>
                                    <th className="px-4 py-3">Faktor</th>
                                    <th className="px-4 py-3 text-right">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                {factors.map(f => (
                                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 font-medium">{f.canton}</td>
                                        <td className="px-4 py-3">
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                value={f.multiplier}
                                                onChange={(e) => handleFactorChange(f.id, parseFloat(e.target.value))}
                                                className="w-20 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-transparent text-right font-mono"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => toggleCanton(f.id)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${f.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                                            >
                                                {f.isActive ? 'Aktiv' : 'Inaktiv'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleDeleteCanton(f.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Add New Canton Form */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center gap-2">
                        <input 
                            type="text" 
                            placeholder="Neuer Kanton (z.B. Uri)"
                            value={newCantonName}
                            onChange={(e) => setNewCantonName(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm"
                        />
                        <input 
                            type="number" 
                            step="0.01"
                            placeholder="1.0"
                            value={newCantonFactor}
                            onChange={(e) => setNewCantonFactor(parseFloat(e.target.value))}
                            className="w-20 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm text-right"
                        />
                        <Button size="sm" onClick={handleAddCanton} disabled={!newCantonName} icon={<Plus size={16} />}>
                            Add
                        </Button>
                    </div>
                </Card>

                {/* General Settings */}
                <div className="space-y-6">
                    <Card title="Verfügbare Steuerjahre">
                        <div className="flex gap-2 mb-4">
                            <input 
                                type="number" 
                                value={newYear}
                                onChange={(e) => setNewYear(parseInt(e.target.value))}
                                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 w-full"
                            />
                            <Button onClick={addYear} icon={<Plus size={18} />}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {years.map(y => (
                                <div key={y} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium">
                                    {y}
                                    <button onClick={() => removeYear(y)} className="text-slate-400 hover:text-red-500">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="KI-Parameter (Google Gemini)">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Standard Model
                                </label>
                                <select className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                                    <option>gemini-3-flash-preview</option>
                                    <option>gemini-3-pro-preview</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Max Token Output (Checklists)
                                </label>
                                <input type="number" defaultValue={2048} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Grounding aktivieren (Google Search)</span>
                                <div className="w-10 h-5 bg-brand-600 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};