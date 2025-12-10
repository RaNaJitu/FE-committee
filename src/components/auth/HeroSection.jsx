import { Badge } from "./Badge.jsx";

export function HeroSection() {
    return (
        <section className="w-full max-w-xl space-y-6 text-center lg:text-left">
            <div className="hidden md:block">
                <Badge>Secure Login Portal</Badge>
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                स्वागत है | <span className="text-yellow-300">कमेटी में</span>
            </h1>
            <p className="hidden text-base text-white/70 sm:block sm:text-lg">
                Manage your projects, track metrics, and stay connected with
                your team. Your personalized dashboard awaits.
            </p>
            <ul className="space-y-3 text-sm text-white/60 hidden md:block">
                <li className="flex items-center justify-center gap-3 lg:justify-start">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-yellow-300">
                        ✓
                    </span>
                    Enterprise-grade security and reliability
                </li>
                <li className="flex items-center justify-center gap-3 lg:justify-start">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-yellow-300">
                        ✓
                    </span>
                    Real-time collaboration with your team
                </li>
                <li className="flex items-center justify-center gap-3 lg:justify-start">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-yellow-300">
                        ✓
                    </span>
                    Personalized insights and reporting
                </li>
            </ul>
        </section>
    );
}

