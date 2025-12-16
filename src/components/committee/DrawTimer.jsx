import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/Button.jsx";

export function DrawTimer({ initialSeconds }) {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(false);
    // Derived minutes and seconds for display
    const { minutes, seconds } = useMemo(() => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        return {
            minutes: String(mins).padStart(2, "0"),
            seconds: String(secs).padStart(2, "0"),
        };
    }, [timeLeft]);

    // Helper to speak a message using the browser SpeechSynthesis API
    const speakReminder = (message) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            return;
        }

        const utterance = new SpeechSynthesisUtterance(message);
   
        // Try to select a female voice if available
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice =
            voices.find((voice) =>
                /female|woman|zira|susan|samantha|victoria/i.test(voice.name),
            ) ?? voices[0];

        if (femaleVoice) {
            utterance.voice = femaleVoice;
      }


        // Cancel any pending speech to avoid overlap
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    // Helper to format time for speech: "1 minute 30 seconds"
    const formatSpokenTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        const parts = [];

        if (mins > 0) {
            parts.push(`${mins} minute${mins !== 1 ? "s" : ""}`);
        }
        if (secs > 0) {
            parts.push(`${secs} second${secs !== 1 ? "s" : ""}`);
        }

        return parts.join(" ");
    };

    // Timer effect
    useEffect(() => {
        if (!isRunning) return;
        if (timeLeft <= 0) {
            setIsRunning(false);
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    return 0;
                }

                const next = prev - 1;

                if (next > 0) {
                    // When 5 seconds or less are left, count down every second: "5", "4", "3", "2", "1"
                    if (next <= 5) {
                        speakReminder(String(next));
                    }
                    // Otherwise, every 5 seconds say how much time is left
                    else if (next % 5 === 0) {
                        const spoken = formatSpokenTime(next);
                        if (spoken) {
                            speakReminder(`${spoken}`);
                        }
                    }
                }

                return next;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isRunning, timeLeft]);

    const handleStartReset = () => {
        // Reset and start from initialSeconds every time the button is clicked
        setTimeLeft(initialSeconds);
        setIsRunning(true);
        const spoken = formatSpokenTime(initialSeconds);
        if (spoken) {
            speakReminder(`Timer started, ${spoken}`);
        } else {
            speakReminder("Timer started");
        }
    };

    return (
        <div className="inline-flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                    <div className="min-w-[44px] rounded-xl border border-white/15 bg-white/5 px-2 py-1 text-center text-sm font-semibold text-white shadow-sm shadow-black/30">
                        {minutes}
                    </div>
                    <span className="mt-0.5 text-[10px] uppercase tracking-wide text-white/60">
                        min
                    </span>
                </div>
                <span className="px-1 text-sm font-semibold text-white/70">:</span>
                <div className="flex flex-col items-center">
                    <div className="min-w-[44px] rounded-xl border border-white/15 bg-white/5 px-2 py-1 text-center text-sm font-semibold text-white shadow-sm shadow-black/30">
                        {seconds}
                    </div>
                    <span className="mt-0.5 text-[10px] uppercase tracking-wide text-white/60">
                        sec
                    </span>
                </div>
            </div>
            <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleStartReset}
                className="mt-1 px-6 text-sm"
            >
                {isRunning ? "Restart Timer" : "Start Timer"}
            </Button>
        </div>
    );
}


