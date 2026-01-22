
import React, { useRef, useEffect, useState } from 'react';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
    width?: number;
    height?: number;
    onEnd?: (dataUrl: string | null) => void;
    className?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ 
    width = 500, 
    height = 200, 
    onEnd,
    className = ''
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, []);

    const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in event) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = (event as React.MouseEvent).clientX;
            clientY = (event as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault(); // Prevent scrolling on touch
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            const { x, y } = getCoordinates(event);
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            const { x, y } = getCoordinates(event);
            ctx.lineTo(x, y);
            ctx.stroke();
            if (!hasSignature) setHasSignature(true);
        }
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            if (onEnd && canvasRef.current) {
                onEnd(canvasRef.current.toDataURL('image/png'));
            }
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasSignature(false);
            if (onEnd) onEnd(null);
        }
    };

    return (
        <div className={`relative group ${className}`}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="bg-white border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-crosshair touch-none w-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-slate-400 text-sm font-medium opacity-50">Hier unterschreiben</span>
                </div>
            )}
            <button
                type="button"
                onClick={clearSignature}
                className="absolute top-2 right-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Unterschrift löschen"
            >
                <Eraser size={16} />
            </button>
        </div>
    );
};
