"use client"

import { useEffect, useState, useRef } from "react"

interface InactivityTimerProps {
    onTimeout: () => void;
}

export function InactivityTimer({ onTimeout }: InactivityTimerProps) {
    const [isIdle, setIsIdle] = useState(false);
    const [countdown, setCountdown] = useState(90); // 1 minuto e 30 secondi

    const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimers = () => {
        setIsIdle(false);
        setCountdown(90);

        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        // 30 seconds of absolute inactivity before showing timer
        idleTimeoutRef.current = setTimeout(() => {
            setIsIdle(true);
        }, 30000);
    };

    useEffect(() => {
        // Initial start
        resetTimers();

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        const handleActivity = () => {
            resetTimers();
        };

        events.forEach(e => document.addEventListener(e, handleActivity));

        return () => {
            events.forEach(e => document.removeEventListener(e, handleActivity));
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (isIdle) {
            countdownIntervalRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        onTimeout();
                        resetTimers();
                        return 90;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [isIdle, onTimeout]);

    if (!isIdle) return null;

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-black/90 backdrop-blur-xl text-white px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 animate-fade-in-up-soft border border-black/20">
            <div className="flex items-center justify-center w-3 h-3 relative">
                <span className="w-full h-full rounded-full bg-red-400 animate-ping absolute"></span>
                <span className="w-2 h-2 rounded-full bg-red-500 relative z-10"></span>
            </div>
            <span className="font-playfair text-xl tracking-wide">Il Kiosk si riavvierà in</span>
            <span className="font-bold text-2xl tabular-nums bg-white/10 px-3 py-1 rounded-lg">
                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </span>
            <span className="text-sm opacity-60 ml-2 font-medium tracking-wider uppercase border-l border-white/20 pl-4 py-1">
                Tocca per continuare
            </span>
        </div>
    )
}
