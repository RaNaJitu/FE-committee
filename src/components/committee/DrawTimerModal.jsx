import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { DrawTimer } from "./DrawTimer.jsx";
import { useState } from "react";


const formatDrawDate = (value) => {
    
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-IN", { month: "short" }).toUpperCase();
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

const formatDrawTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    const minuteStr = minutes ? `:${minutes.toString().padStart(2, "0")}` : "";
    return `${hour12}${minuteStr}${period}`;
};

export function DrawTimerModal({ isOpen, onClose, draw, committeeName }) {
  // const [ initialSeconds, setInitialSeconds ] = useState(process.env.REACT_APP_DRAW_TIMER_SECONDS || 60);
    if (!draw) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={null}
                description={null}
                variant="bare"
                showCloseButton={false}
            >
                <div className="flex items-center justify-center py-4">
                    <div className="w-full max-w-xs rounded-[28px] border border-blue-400/30 bg-blue-500/10 text-slate-50 shadow-2xl shadow-blue-900/40 px-6 py-6">
                        <div className="relative text-center mb-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute right-0 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/10 text-[13px] text-slate-500 hover:bg-slate-900/20 hover:text-slate-700 transition"
                                aria-label="Close timer"
                            >
                                ×
                            </button>
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                                Draw timer
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">
                                Countdown with voice reminder every 5 seconds
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <DrawTimer initialSeconds={60} />
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }

    const formattedDate = formatDrawDate(
        draw?.committeeDrawDate ?? draw?.drawDate ?? draw?.date,
    );
    const formattedTime = formatDrawTime(
        draw?.committeeDrawTime ?? draw?.drawTime ?? draw?.time,
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={null}
            description={null}
            variant="bare"
            showCloseButton={false}
        >
                <div className="flex items-center justify-center py-4">
                <div className="w-full max-w-xs rounded-[28px] border border-blue-400/30 bg-blue-500/10 text-slate-50 shadow-2xl shadow-blue-900/40 px-6 py-6">
                    <div className="relative text-center mb-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-0 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/10 text-[13px] text-slate-500 hover:bg-slate-900/20 hover:text-slate-700 transition"
                            aria-label="Close timer"
                        >
                            ×
                        </button>
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                            {formattedDate ?? "-"} Draw timer
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                            Complete this draw within the time shown below
                        </p>
                    </div>
                    <div className="flex justify-center mb-4">
                        {/* Timer UI – click Start/Restart to begin, every 5s voice says how much time is left */}
                        <DrawTimer initialSeconds={60} />
                    </div>
                    <div className="text-center">
                        <p className="text-[11px] text-slate-200">
                            Draw date: <span className="font-medium text-white">{formattedDate}</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-200">
                            Draw time: <span className="font-medium text-white">{formattedTime}</span>
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}


