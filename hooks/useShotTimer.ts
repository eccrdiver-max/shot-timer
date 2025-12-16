import { useState, useEffect, useRef, useCallback } from 'react';
import { Shot, Settings } from '../types';
import { useI18n } from './useI18n';

interface UseShotTimerProps {
    settings: Settings;
    parTime: number;
}

export const useShotTimer = ({ settings, parTime }: UseShotTimerProps) => {
    const { t } = useI18n();
    const [status, setStatus] = useState<'idle' | 'waiting' | 'running' | 'stopped'>('idle');
    const [timer, setTimer] = useState(0);
    const [shots, setShots] = useState<Shot[]>([]);
    const [isParTimeExceeded, setIsParTimeExceeded] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const lastShotTimeRef = useRef<number>(0);
    const timeoutRef = useRef<number | null>(null);
    const parTimeoutRef = useRef<number | null>(null);
    
    const stopAudio = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(e => console.error("Error closing AudioContext", e));
        }
        audioContextRef.current = null;
        analyserRef.current = null;
    }, []);
    
    const handleReset = useCallback(() => {
        setStatus('idle');
        setTimer(0);
        setShots([]);
        setIsParTimeExceeded(false);
        startTimeRef.current = 0;
        lastShotTimeRef.current = 0;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (parTimeoutRef.current) {
            clearTimeout(parTimeoutRef.current);
            parTimeoutRef.current = null;
        }
        stopAudio();
    }, [stopAudio]);

    const handleStop = useCallback(() => {
        if (status !== 'running' && status !== 'waiting') return;
        setStatus('stopped');
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (parTimeoutRef.current) {
            clearTimeout(parTimeoutRef.current);
            parTimeoutRef.current = null;
        }
        stopAudio();
    }, [stopAudio, status]);
    
    useEffect(() => {
        if (status !== 'running') {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            return;
        }
    
        const audioLoop = () => {
            // Shot detection logic
            if (analyserRef.current && audioContextRef.current?.state === 'running') {
                const bufferLength = analyserRef.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyserRef.current.getByteTimeDomainData(dataArray);
    
                let peak = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const value = Math.abs(dataArray[i] - 128);
                    if (value > peak) peak = value;
                }
    
                const normalizedPeak = (peak / 128) * 100;
                const sensitivityThreshold = 101 - settings.micSensitivity;
    
                if (normalizedPeak > sensitivityThreshold) {
                    const now = performance.now();
                    const shotTime = (now - startTimeRef.current) / 1000;
                    
                    if (shotTime > 0.05 && shotTime - lastShotTimeRef.current > 0.1) { // 50ms blanking + 100ms split time
                        setShots(prev => [...prev, { time: shotTime }]);
                        lastShotTimeRef.current = shotTime;
                    }
                }
            }
    
            // Timer update and auto-stop logic
            if (startTimeRef.current > 0) {
                const elapsed = (performance.now() - startTimeRef.current) / 1000;
                setTimer(elapsed);

                if (parTime > 0 && elapsed > parTime) {
                    setIsParTimeExceeded(true);
                }
    
                if (shots.length > 0 && settings.autoStopDelay > 0 && lastShotTimeRef.current > 0) {
                    if (elapsed - lastShotTimeRef.current > settings.autoStopDelay) {
                        handleStop();
                        return; // Stop the loop
                    }
                }
            }
            animationFrameRef.current = requestAnimationFrame(audioLoop);
        };
    
        audioLoop();
    
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [status, settings, shots, handleStop, parTime]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, [stopAudio]);

    const playBeep = (duration = 0.15, frequency = 1000) => {
        if (audioContextRef.current) {
            const beep = audioContextRef.current.createOscillator();
            beep.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
            beep.connect(audioContextRef.current.destination);
            beep.start();
            beep.stop(audioContextRef.current.currentTime + duration);
            return new Promise(resolve => {
                beep.onended = () => resolve(true);
            });
        }
        return Promise.resolve(false);
    }

    const handleStart = async () => {
        if (status === 'running' || status === 'waiting') return;
        handleReset();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const context = new AudioContext();
            audioContextRef.current = context;
            const source = context.createMediaStreamSource(stream);
            const analyser = context.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            analyserRef.current = analyser;

            setStatus('waiting');
            const delay = settings.randomStartMin * 1000 + Math.random() * (settings.randomStartMax - settings.randomStartMin) * 1000;
        
            timeoutRef.current = window.setTimeout(async () => {
                if (audioContextRef.current && mediaStreamRef.current) {
                    await playBeep();
                    setStatus('running');
                    startTimeRef.current = performance.now();
                    lastShotTimeRef.current = 0;

                    if (parTime > 0) {
                        parTimeoutRef.current = window.setTimeout(() => {
                            playBeep(0.2, 800); // a slightly different beep for par
                        }, parTime * 1000);
                    }
                }
            }, delay);

        } catch (err) {
            console.error('Error accessing microphone', err);
            alert(t('alert_mic_permission'));
            handleReset();
        }
    };

    const totalTime = shots.length > 0 ? shots[shots.length - 1].time : 0;
    const firstShot = shots.length > 0 ? shots[0].time : 0;
    const splits = shots.map((shot, index) => {
        if (index === 0) return shot.time;
        return shot.time - shots[index - 1].time;
    });

    return {
        status,
        timer,
        shots,
        totalTime,
        firstShot,
        splits,
        isParTimeExceeded,
        handleStart,
        handleStop,
        handleReset,
    };
};