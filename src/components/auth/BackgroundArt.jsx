export function BackgroundArt() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-[-20%] top-[-30%] h-[60rem] w-[60rem] rounded-full bg-purple-600/40 blur-[180px]" />
            <div className="absolute bottom-[-20%] right-[-10%] h-[50rem] w-[50rem] rounded-full bg-yellow-500/30 blur-[160px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_60%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(140deg,_rgba(255,255,255,0.06),_transparent_55%)]" />
        </div>
    );
}

