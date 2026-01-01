
import React, { useState } from 'react';
import { TrustScore, ComplianceCheck } from '../../types';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ComplianceShieldProps {
    score?: TrustScore;
    onRunCheck?: () => void;
    isLoading?: boolean;
}

export const ComplianceShield: React.FC<ComplianceShieldProps> = ({ score, onRunCheck, isLoading }) => {
    const [expanded, setExpanded] = useState(false);

    if (!score) {
        return (
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <ShieldCheck size={32} className="text-slate-400 mb-2" />
                <p className="text-sm text-slate-500 font-medium">Keine Compliance-Daten</p>
                <button 
                    onClick={onRunCheck}
                    disabled={isLoading}
                    className="mt-2 text-xs font-bold text-brand-600 hover:underline disabled:opacity-50"
                >
                    {isLoading ? 'Prüfe...' : 'Jetzt prüfen'}
                </button>
            </div>
        );
    }

    const getColor = (level: string) => {
        switch(level) {
            case 'HIGH': return 'text-emerald-500 bg-emerald-500';
            case 'MEDIUM': return 'text-amber-500 bg-amber-500';
            case 'LOW': 
            case 'CRITICAL': return 'text-red-500 bg-red-500';
            default: return 'text-slate-500 bg-slate-500';
        }
    };

    const colorClass = getColor(score.level);
    const strokeClass = colorClass.split(' ')[0]; // Extract text class for stroke

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {/* Header / Score */}
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-slate-800" />
                            <circle 
                                cx="24" cy="24" r="20" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="4" 
                                className={`${strokeClass} transition-all duration-1000`} 
                                strokeDasharray={125} 
                                strokeDashoffset={125 - (125 * score.score) / 100} 
                                strokeLinecap="round" 
                            />
                        </svg>
                        <ShieldCheck size={20} className={strokeClass} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Trust Score</h3>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white ${colorClass.split(' ')[1]}`}>
                                {score.level}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">Zuletzt geprüft: {score.lastUpdated}</p>
                    </div>
                </div>
                <div>
                    {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
            </div>

            {/* Details */}
            {expanded && (
                <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 p-4 space-y-3 animate-in slide-in-from-top-2">
                    {score.checks.map(check => (
                        <div key={check.id} className="flex items-start gap-3 text-sm">
                            <div className="mt-0.5">
                                {check.status === 'PASSED' && <CheckCircle size={16} className="text-emerald-500" />}
                                {check.status === 'WARNING' && <AlertTriangle size={16} className="text-amber-500" />}
                                {check.status === 'FAILED' && <XCircle size={16} className="text-red-500" />}
                            </div>
                            <div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">{check.checkName}</p>
                                {check.details && <p className="text-xs text-slate-500 mt-0.5">{check.details}</p>}
                            </div>
                        </div>
                    ))}
                    <div className="pt-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRunCheck && onRunCheck(); }}
                            disabled={isLoading}
                            className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-brand-500 hover:text-brand-500 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Prüfung läuft...' : 'Live-Prüfung wiederholen'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
