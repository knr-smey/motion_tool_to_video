"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Upload, Check, X, Volume2, Sparkles } from "lucide-react";
import type { Scene } from "@/lib/segmentation";

interface VoiceoverModalProps {
  isOpen: boolean;
  scene: Scene | undefined;
  sceneIndex: number;
  onClose: () => void;
  onSaveAudio: (sceneIndex: number, audioDataUrl: string, durationSeconds: number) => void;
  onRemoveAudio: (sceneIndex: number) => void;
}

export function VoiceoverModal({
  isOpen,
  scene,
  sceneIndex,
  onClose,
  onSaveAudio,
  onRemoveAudio,
}: VoiceoverModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [measuredDuration, setMeasuredDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scene?.audioUrl) {
      setRecordedAudioUrl(scene.audioUrl);
      setMeasuredDuration(scene.audioDurationSeconds || scene.durationSeconds);
    } else {
      setRecordedAudioUrl(null);
      setMeasuredDuration(null);
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setError(null);
  }, [scene, isOpen]);

  if (!isOpen || !scene) return null;

  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setRecordedAudioUrl(dataUrl);

          // Measure duration
          const tempAudio = new window.Audio();
          tempAudio.src = dataUrl;
          tempAudio.onloadedmetadata = () => {
            const dur = Math.max(1.0, Math.round(tempAudio.duration * 10) / 10);
            setMeasuredDuration(dur);
          };
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks to turn off microphone indicator
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 0.1);
      }, 100);
    } catch {
      setError("Microphone access denied. Please allow microphone permission in your browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setRecordedAudioUrl(dataUrl);

      const tempAudio = new window.Audio();
      tempAudio.src = dataUrl;
      tempAudio.onloadedmetadata = () => {
        const dur = Math.max(1.0, Math.round(tempAudio.duration * 10) / 10);
        setMeasuredDuration(dur);
      };
    };
    reader.readAsDataURL(file);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !recordedAudioUrl) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSave = () => {
    if (!recordedAudioUrl) return;
    const dur = measuredDuration || Math.max(1.0, Math.round(recordingSeconds * 10) / 10);
    onSaveAudio(sceneIndex, recordedAudioUrl, dur);
    onClose();
  };

  const handleRemove = () => {
    onRemoveAudio(sceneIndex);
    setRecordedAudioUrl(null);
    setMeasuredDuration(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
              <Mic size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>Record Scene #{sceneIndex + 1} Voice</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                  Voiceover
                </span>
              </h2>
              <p className="text-xs text-muted">
                Speak your Khmer narration. The video scene duration will auto-sync with your voice!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-raised hover:text-foreground transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Text prompt to read */}
        <div className="my-4 rounded-xl border border-border/80 bg-surface-raised p-4">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
            Read this sentence out loud:
          </span>
          <p className="font-[family-name:var(--font-kantumruy-pro)] text-base font-medium leading-relaxed text-foreground select-all">
            &ldquo;{scene.text}&rdquo;
          </p>
        </div>

        {/* Recording Visualizer & Status */}
        <div className="flex flex-col items-center justify-center py-4 rounded-xl border border-dashed border-border bg-black/30">
          {isRecording ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-rose-500 font-mono text-xl font-bold animate-pulse">
                <span className="h-3.5 w-3.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
                <span>REC {recordingSeconds.toFixed(1)}s</span>
              </div>
              <p className="text-xs text-muted">Speaking into microphone...</p>
            </div>
          ) : recordedAudioUrl ? (
            <div className="flex flex-col items-center gap-3 w-full px-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <Volume2 size={16} />
                  <span>Voiceover Recorded ({measuredDuration ? `${measuredDuration}s` : "Ready"})</span>
                </div>
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="flex items-center gap-1.5 rounded-full bg-surface-raised border border-border px-3 py-1 text-xs text-foreground hover:border-accent transition cursor-pointer"
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlaying ? "Pause" : "Listen Preview"}</span>
                </button>
              </div>

              {/* Fake animated audio waveform */}
              <div className="flex items-center justify-center gap-1 h-8 w-full">
                {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 35, 75, 60, 85, 40, 70].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1.5 rounded-full bg-emerald-500/70"
                  />
                ))}
              </div>

              <audio
                ref={audioPlayerRef}
                src={recordedAudioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted">
              <Mic size={28} className="opacity-40" />
              <span className="text-xs">Click the red button below to start recording</span>
            </div>
          )}

          {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-border/60 mt-4">
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition cursor-pointer"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                <span>{recordedAudioUrl ? "Re-record" : "Start Recording"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 px-4 py-2 text-xs font-bold hover:bg-rose-500/30 transition cursor-pointer"
              >
                <Square size={14} className="fill-current" />
                <span>Stop Recording</span>
              </button>
            )}

            {/* File Upload Option */}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecording}
              className="flex items-center gap-1 rounded-lg border border-border bg-surface-raised px-2.5 py-2 text-xs text-muted hover:text-foreground hover:border-accent transition cursor-pointer disabled:opacity-40"
              title="Upload MP3 or audio file"
            >
              <Upload size={13} />
              <span>Upload Audio</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {scene.audioUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isRecording}
                className="text-xs text-rose-400 hover:underline px-2 cursor-pointer"
              >
                Remove
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={!recordedAudioUrl || isRecording}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/30 hover:opacity-95 transition cursor-pointer disabled:opacity-40"
            >
              <Check size={14} />
              <span>Save & Sync Duration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
