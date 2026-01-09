import { useEffect, useState, useRef } from "react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";

export function LotteryResultModal({
    isOpen,
    onClose,
    lotteryResult,
    isLoading,
    onSubmit,
    onCancel,
    isSubmitting,
    membersList = [],
}) {
    const [showResult, setShowResult] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const animationFrameRef = useRef(null);
    const startTimeRef = useRef(null);
    const winnerIndexRef = useRef(-1);
    const itemHeight = 80; // Height of each item in pixels

    // Prepare members for animation (duplicate list for seamless scrolling)
    const displayMembers = membersList.length > 0 
        ? [...membersList, ...membersList, ...membersList] 
        : [];

    // Reset animation when modal opens
    useEffect(() => {
        if (isOpen && isLoading) {
            setShowResult(false);
            setScrollPosition(0);
            setIsScrolling(true);
            startTimeRef.current = Date.now();
            winnerIndexRef.current = -1;
        } else if (!isOpen) {
            setShowResult(false);
            setScrollPosition(0);
            setIsScrolling(false);
        }
    }, [isOpen, isLoading]);

    // Find winner index in members list
    useEffect(() => {
        if (lotteryResult && membersList.length > 0 && !showResult) {
            const winnerId = lotteryResult?.id ?? lotteryResult?.userId ?? lotteryResult?.user?.id;
            const winnerPhone = lotteryResult?.phoneNo ?? lotteryResult?.phone ?? lotteryResult?.user?.phoneNo;
            
            const index = membersList.findIndex((member) => {
                const memberId = member?.user?.id ?? member?.userId ?? member?.id;
                const memberPhone = member?.user?.phoneNo ?? member?.phone;
                return memberId === winnerId || memberPhone === winnerPhone;
            });
            
            winnerIndexRef.current = index >= 0 ? index : Math.floor(Math.random() * membersList.length);
        }
    }, [lotteryResult, membersList, showResult]);

    // Animation loop
    useEffect(() => {
        if (!isScrolling || !isLoading || !isOpen || membersList.length === 0) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            return;
        }

        const animate = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const duration = 5000; // 5 seconds total
            
            if (elapsed < duration) {
                let speed;
                // Fast scrolling phase (first 4 seconds)
                if (elapsed < 4000) {
                    speed = 25 - (elapsed / 4000) * 10; // Start fast, gradually slow down
                } else {
                    // Slow down phase (last 1 second)
                    const remaining = elapsed - 4000;
                    speed = 15 - (remaining / 1000) * 14; // Slow down to almost stop
                }
                
                setScrollPosition((prev) => {
                    const maxScroll = displayMembers.length * itemHeight;
                    const newPos = prev + speed;
                    // Loop back to start if we've scrolled past the end
                    return newPos >= maxScroll ? newPos - maxScroll : newPos;
                });
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                // Stop at winner position
                if (winnerIndexRef.current >= 0 && membersList.length > 0) {
                    // Calculate position to show winner in the center (accounting for duplicated list)
                    const targetPosition = (winnerIndexRef.current + membersList.length) * itemHeight - (itemHeight * 2);
                    setScrollPosition(targetPosition);
                }
                setIsScrolling(false);
                setShowResult(true);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isScrolling, isLoading, isOpen, itemHeight, membersList.length, displayMembers.length]);

    if (!isOpen) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title="Lottery Draw"
            description={showResult ? "The randomly selected winner for this lottery draw." : "Drawing lottery winner..."}
            footer={
                <div className="flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isSubmitting || isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onSubmit}
                        isLoading={isSubmitting}
                        disabled={isSubmitting || !showResult || !lotteryResult}
                    >
                        Submit
                    </Button>
                </div>
            }
        >
            {isLoading && isScrolling ? (
                <div className="space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-white/60 mb-4">Selecting winner...</p>
                    </div>
                    <div className="relative h-64 overflow-hidden rounded-lg border border-white/10 bg-slate-950/30">
                        <div 
                            className="transition-transform duration-75 ease-linear"
                            style={{
                                transform: `translateY(-${scrollPosition % (displayMembers.length * itemHeight)}px)`,
                            }}
                        >
                            {displayMembers.map((member, index) => {
                                const name = member?.user?.name ?? member.memberName ?? "—";
                                const phone = member?.user?.phoneNo ?? member.phone ?? "—";
                                const email = member?.user?.email ?? member.email ?? "—";
                                const id = member?.user?.id ?? member?.userId ?? member?.id ?? index;
                                
                                return (
                                    <div
                                        key={`${id}-${index}`}
                                        className="lottery-item flex items-center justify-between px-6 py-4 border-b border-white/5"
                                        style={{ height: `${itemHeight}px`, minHeight: `${itemHeight}px` }}
                                    >
                                        <div className="flex-1 grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-white/50 uppercase tracking-wide">Name</p>
                                                <p className="text-sm font-semibold text-white mt-1">{name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/50 uppercase tracking-wide">Phone</p>
                                                <p className="text-sm text-white mt-1">{phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/50 uppercase tracking-wide">Email</p>
                                                <p className="text-sm text-white mt-1 truncate">{email}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Highlight overlay for winner */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 pointer-events-none border-y-2 border-yellow-400/50 bg-yellow-400/10 z-10"></div>
                    </div>
                </div>
            ) : showResult && lotteryResult ? (
                <div className="space-y-6">
                    <div className="rounded-lg border-2 border-yellow-400/50 bg-yellow-400/10 p-6 animate-pulse">
                        <div className="text-center mb-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400/20 mb-3">
                                <span className="text-3xl">🎉</span>
                            </div>
                            <h3 className="text-lg font-semibold text-yellow-300 uppercase tracking-wide">
                                Winner Selected!
                            </h3>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-slate-950/30 p-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60 mb-4">
                                Winner Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                        ID
                                    </label>
                                    <p className="text-sm text-white/90 font-medium">
                                        {lotteryResult?.id ?? lotteryResult?.userId ?? lotteryResult?.user?.id ?? "—"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                        Name
                                    </label>
                                    <p className="text-sm text-white/90 font-medium">
                                        {lotteryResult?.name ?? lotteryResult?.user?.name ?? lotteryResult?.userName ?? "—"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                        Phone Number
                                    </label>
                                    <p className="text-sm text-white/90 font-medium">
                                        {lotteryResult?.phoneNo ?? lotteryResult?.phone ?? lotteryResult?.user?.phoneNo ?? "—"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                        Email
                                    </label>
                                    <p className="text-sm text-white/90 font-medium">
                                        {lotteryResult?.email ?? lotteryResult?.user?.email ?? "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </Modal>
    );
}
