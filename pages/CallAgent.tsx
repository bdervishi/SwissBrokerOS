import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import { SensitiveData } from '../components/ui/SensitiveData';
import { AgentComparison } from '../components/marketing/AgentComparison';
import { 
    Phone, 
    PhoneOff, 
    Mic, 
    MicOff, 
    Volume2, 
    User, 
    Building2, 
    Target, 
    History, 
    Play, 
    Square, 
    CheckCircle, 
    XCircle, 
    Activity, 
    Bot, 
    Settings, 
    Clock, 
    DollarSign, 
    Zap,
    BarChart3
} from 'lucide-react';

// --- CONSTANTS ---
const CALL_SCRIPTS = [
    { id: 'script_acq', title: 'Broker Akquise (Kalt)', description: 'Fokus auf Schmerzpunkte: Zeitverlust & Compliance.' },
    { id: 'script_demo', title: 'Demo Follow-Up', description: 'Nachfassen nach Demo-Termin.' },
    { id: 'script_support', title: 'Support Receptionist', description: 'Inbound First-Level Support.' },
];

const VOICES = [
    { id: 'Zephyr', label: 'Zephyr (Ausgewogen)', gender: 'Male' },
    { id: 'Puck', label: 'Puck (Energisch)', gender: 'Male' },
    { id: 'Kore', label: 'Kore (Ruhig)', gender: 'Female' },
    { id: 'Fenrir', label: 'Fenrir (Tief)', gender: 'Male' },
    { id: 'Aoede', label: 'Aoede (Professionell)', gender: 'Female' },
];

export const CallAgent: React.FC = () => {
    const { role } = useAuth();
    
    // --- STATE ---
    const [viewMode, setViewMode] = useState<'PHONE' | 'ROI'>('PHONE'); // Switch between Live Phone and Sales Pitch
    
    const [activeScript, setActiveScript] = useState(CALL_SCRIPTS[0]);
    const [selectedVoice, setSelectedVoice] = useState('Kore'); // Default friendly female voice
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0); 
    const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'LISTENING' | 'SPEAKING'>('IDLE');
    
    // Stats State
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [estimatedCost, setEstimatedCost] = useState(0);
    
    // --- REFS ---
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
    // Use number for browser-side timer ID
    const timerRef = useRef<number | null>(null);

    // --- ACCESS CONTROL ---
    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_ACQUISITION && role !== UserRole.SAAS_SALES) {
        return <Navigate to="/dashboard" />;
    }

    // Timer Logic for Duration & Cost
    useEffect(() => {
        if (isConnected) {
            timerRef.current = window.setInterval(() => {
                setDurationSeconds(prev => {
                    const newDur = prev + 1;
                    // Estimation: ~0.08 CHF per minute (Input + Output + Processing)
                    // This is a SaaS calc including margin
                    setEstimatedCost((newDur / 60) * 0.08); 
                    return newDur;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isConnected]);

    // Format Seconds to MM:SS
    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    // --- AUDIO HELPERS ---
    function decodeBase64Audio(base64: string) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    function arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function floatTo16BitPCM(input: Float32Array) {
        const output = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return output.buffer;
    }

    const startCall = async () => {
        // The realtime Live (voice) API cannot use the secure HTTP proxy, so it
        // needs an explicit, opt-in client key. Unset by default to avoid
        // shipping a key in the bundle.
        const liveKey = (import.meta as any).env?.VITE_GEMINI_LIVE_KEY;
        if(!liveKey) {
            alert("Live-Voice ist nicht konfiguriert (VITE_GEMINI_LIVE_KEY fehlt).");
            return;
        }

        setStatus('CONNECTING');
        setDurationSeconds(0);
        setEstimatedCost(0);

        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = audioContextRef.current.currentTime;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true // Important for "Real" feel
            }});
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: liveKey });
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } }
                    },
                    systemInstruction: `
                        Du bist ein professioneller Sales-Mitarbeiter (SDR) für SwissBroker OS.
                        Dein Name ist "Sarah" (oder passend zur Stimme).
                        
                        Kontext: Du rufst einen Versicherungsbroker in der Schweiz an.
                        Ziel: ${activeScript.title} - ${activeScript.description}
                        
                        Stil:
                        - Sprich natürlich, nicht wie ein Roboter.
                        - Nutze gelegentlich Füllwörter wie "ähm" oder "ja genau", um menschlich zu wirken.
                        - Lass den anderen ausreden, aber unterbrich höflich, wenn nötig (Gemini Native Audio Feature).
                        - Sei selbstbewusst aber empathisch.
                        
                        Sprache: Deutsch (Hochdeutsch mit Schweizer Einfärbung im Vokabular, z.B. "Offerte" statt "Angebot").
                    `
                },
                callbacks: {
                    onopen: () => {
                        console.log("Connected to Gemini Live");
                        setStatus('LISTENING');
                        setIsConnected(true);
                        
                        if (!audioContextRef.current) return;
                        
                        const source = audioContextRef.current.createMediaStreamSource(stream);
                        const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = processor;

                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            
                            // Visualizer Data
                            let sum = 0;
                            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                            const rms = Math.sqrt(sum / inputData.length);
                            setVolumeLevel(Math.min(100, rms * 400)); 

                            const pcmData = floatTo16BitPCM(inputData);
                            const base64Data = arrayBufferToBase64(pcmData);
                            
                            sessionPromise.then(session => {
                                session.sendRealtimeInput({
                                    media: {
                                        mimeType: 'audio/pcm;rate=16000',
                                        data: base64Data
                                    }
                                });
                            });
                        };

                        source.connect(processor);
                        processor.connect(audioContextRef.current.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData && audioContextRef.current) {
                            setStatus('SPEAKING');
                            const binary = decodeBase64Audio(audioData);
                            const float32 = new Float32Array(binary.length / 2);
                            const dataView = new DataView(binary.buffer);
                            
                            for (let i = 0; i < float32.length; i++) {
                                float32[i] = dataView.getInt16(i * 2, true) / 32768.0;
                            }

                            const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
                            buffer.getChannelData(0).set(float32);

                            const source = audioContextRef.current.createBufferSource();
                            source.buffer = buffer;
                            source.connect(audioContextRef.current.destination);
                            
                            const startTime = Math.max(audioContextRef.current.currentTime, nextStartTimeRef.current);
                            source.start(startTime);
                            nextStartTimeRef.current = startTime + buffer.duration;
                            
                            scheduledSourcesRef.current.push(source);
                            
                            source.onended = () => {
                                if (audioContextRef.current && audioContextRef.current.currentTime >= nextStartTimeRef.current - 0.1) {
                                    setStatus('LISTENING');
                                }
                            };
                        }
                        
                        // Interrupt handling
                        if (msg.serverContent?.interrupted) {
                            console.log("Model interrupted by user");
                            scheduledSourcesRef.current.forEach(s => s.stop());
                            scheduledSourcesRef.current = [];
                            nextStartTimeRef.current = 0;
                            setStatus('LISTENING'); // Switch back to listening immediately
                        }
                    },
                    onclose: () => {
                        endCall();
                    },
                    onerror: (err) => {
                        console.error("Gemini Error", err);
                        endCall();
                    }
                }
            });

        } catch (e) {
            console.error("Failed to start call", e);
            setStatus('IDLE');
        }
    };

    const endCall = () => {
        setIsConnected(false);
        setStatus('IDLE');
        setVolumeLevel(0);

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        scheduledSourcesRef.current.forEach(source => source.stop());
        scheduledSourcesRef.current = [];
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    const toggleMute = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getAudioTracks()[0].enabled = isMuted; 
            setIsMuted(!isMuted);
        }
    };

    const Visualizer = () => {
        return (
            <div className="flex items-center justify-center gap-1 h-12">
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-2 rounded-full transition-all duration-75 ${status === 'SPEAKING' ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        style={{ 
                            height: status === 'SPEAKING' ? `${20 + Math.random() * 80}%` : 
                                    status === 'LISTENING' ? `${10 + (volumeLevel > 5 ? volumeLevel : 0)}%` : '10%' 
                        }} 
                    />
                ))}
            </div>
        );
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Phone className="text-brand-600" />
                        AI Call Agent
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Native Audio Streaming (Low Latency). Klingt wie ein Mensch.
                    </p>
                </div>
                <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                    <button 
                        onClick={() => setViewMode('PHONE')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${viewMode === 'PHONE' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}
                    >
                        <Phone size={16}/> Live Terminal
                    </button>
                    <button 
                        onClick={() => setViewMode('ROI')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${viewMode === 'ROI' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}
                    >
                        <BarChart3 size={16}/> ROI & Vergleich
                    </button>
                </div>
            </div>

            {viewMode === 'ROI' ? (
                <AgentComparison />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT: Config Panel */}
                    <div className="space-y-6">
                        <Card title="Kampagne">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Aktives Skript</label>
                                    <div className="space-y-2">
                                        {CALL_SCRIPTS.map(script => (
                                            <div 
                                                key={script.id}
                                                onClick={() => !isConnected && setActiveScript(script)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                    activeScript.id === script.id 
                                                    ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500 dark:bg-brand-900/20' 
                                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300'
                                                } ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{script.title}</div>
                                                <div className="text-xs text-slate-500 mt-1">{script.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Voice & Personality">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Stimme</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {VOICES.map(voice => (
                                            <button
                                                key={voice.id}
                                                onClick={() => !isConnected && setSelectedVoice(voice.id)}
                                                className={`p-2 rounded-lg border text-sm text-left transition-colors ${
                                                    selectedVoice === voice.id
                                                    ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600'
                                                } ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="font-bold">{voice.label}</div>
                                                <div className="text-xs opacity-70">{voice.gender}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex gap-2">
                                    <Zap size={14} className="shrink-0 mt-0.5"/>
                                    <p><strong>Tipp:</strong> "Kore" wirkt sehr vertrauenswürdig bei Finanzen. "Puck" ist besser für Startups.</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* CENTER: Phone Interface */}
                    <div className="lg:col-span-2 flex flex-col">
                        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col relative min-h-[500px]">
                            
                            {/* Status Bar */}
                            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                            {status === 'IDLE' ? 'Getrennt' : status === 'CONNECTING' ? 'Verbinde...' : 'Live Anruf'}
                                        </span>
                                    </div>
                                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Settings size={14} />
                                        <span className="text-xs">Native Audio Mode</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono text-sm">
                                        <Clock size={14} />
                                        {formatTime(durationSeconds)}
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-sm bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                        <DollarSign size={12} />
                                        {estimatedCost.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Main Visualizer Area */}
                            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                                {/* Avatar / Visual */}
                                <div className="relative mb-8">
                                    <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        status === 'SPEAKING' 
                                        ? 'bg-brand-100 dark:bg-brand-900/20 ring-4 ring-brand-500/20 scale-110' 
                                        : 'bg-slate-100 dark:bg-slate-800'
                                    }`}>
                                        <Bot size={48} className={status === 'SPEAKING' ? 'text-brand-600' : 'text-slate-400'} />
                                    </div>
                                    {status === 'SPEAKING' && (
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            SPRICHT
                                        </div>
                                    )}
                                </div>

                                {/* Waveform */}
                                <div className="w-full max-w-md h-16 mb-8 flex items-center justify-center">
                                    {isConnected ? (
                                        <Visualizer />
                                    ) : (
                                        <div className="text-slate-400 text-sm">Bereit zum Anruf</div>
                                    )}
                                </div>

                                {/* Live Transcript Snippet */}
                                {isConnected && (
                                    <div className="w-full max-w-lg text-center space-y-2">
                                        <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Live Status</p>
                                        <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
                                            {status === 'SPEAKING' 
                                            ? `${selectedVoice} spricht...` 
                                            : status === 'LISTENING' ? "Hört zu..." : ""}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-6">
                                <button 
                                    onClick={toggleMute}
                                    disabled={!isConnected}
                                    className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'} disabled:opacity-50`}
                                >
                                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                </button>

                                {!isConnected ? (
                                    <button 
                                        onClick={startCall}
                                        className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105"
                                    >
                                        <Phone size={32} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={endCall}
                                        className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all transform hover:scale-105"
                                    >
                                        <PhoneOff size={32} />
                                    </button>
                                )}

                                <button className="p-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50" disabled={!isConnected}>
                                    <Volume2 size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </Layout>
    );
};
