import { useEffect, useState, useRef } from "react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { getCommitteeMembers, getLotteryRandomUser } from "../../services/apiClient.js";
import { useToast } from "../../context/ToastContext.jsx";

export function LotteryWheelModal({
    isOpen,
    onClose,
    committee,
    token,
    onSubmit,
    onCancel,
    isSubmitting,
}) {
    const { showToast } = useToast();
    const [members, setMembers] = useState([]);
    const [eligibleMembers, setEligibleMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [rotation, setRotation] = useState(0);
    const wheelRef = useRef(null);
    const error = useState("");

    // Load members when modal opens
    useEffect(() => {
        if (isOpen && committee?.id && token) {
            setIsLoading(true);
            getCommitteeMembers(token, committee.id)
                .then((response) => {
                    const membersList = Array.isArray(response?.data)
                        ? response.data
                        : Array.isArray(response)
                            ? response
                            : [];
                    setMembers(membersList);
                    
                    // Filter members where isUserDrawCompleted is false
                    const eligible = membersList.filter((member) => {
                        const isCompleted = member?.user?.isUserDrawCompleted ?? false;
                        return !isCompleted;
                    });
                    setEligibleMembers(eligible);
                })
                .catch((err) => {
                    showToast({
                        title: "Failed to load members",
                        description: err.message || "Unable to load committee members.",
                        variant: "error",
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else if (!isOpen) {
            setMembers([]);
            setEligibleMembers([]);
            setWinner(null);
            setRotation(0);
        }
    }, [isOpen, committee?.id, token]);

    const handleSpin = async () => {
        if (eligibleMembers.length === 0) {
            showToast({
                title: "No eligible members",
                description: "All members have completed their draws.",
                variant: "warning",
            });
            return;
        }

        setIsSpinning(true);
        setWinner(null);

        // Call the lottery API
        try {
            const response = await getLotteryRandomUser(token, committee.id);
            const result = response?.data ?? response ?? null;
            
            // Find the winner in eligible members
            const winnerId = result?.id ?? result?.userId ?? result?.user?.id;
            const winnerPhone = result?.phoneNo ?? result?.phone ?? result?.user?.phoneNo;
            
            const winnerIndex = eligibleMembers.findIndex((member) => {
                const memberId = member?.user?.id ?? member?.userId ?? member?.id;
                const memberPhone = member?.user?.phoneNo ?? member?.phone;
                return memberId === winnerId || memberPhone === winnerPhone;
            });

            if (winnerIndex >= 0) {
                const selectedWinner = eligibleMembers[winnerIndex];
                setWinner(selectedWinner);
                
                // Calculate rotation to stop on winner
                const segmentAngle = 360 / eligibleMembers.length;
                const targetAngle = winnerIndex * segmentAngle;
                // Add multiple full rotations for spinning effect
                const spinRotations = 5; // 5 full rotations
                const finalRotation = spinRotations * 360 + (360 - targetAngle) + (segmentAngle / 2);
                
                setRotation(finalRotation);
                
                // After animation completes, show winner
                setTimeout(() => {
                    setIsSpinning(false);
                }, 5000); // Match animation duration
            } else {
                // If winner not found in eligible, use random
                const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
                const selectedWinner = eligibleMembers[randomIndex];
                setWinner(selectedWinner);
                
                const segmentAngle = 360 / eligibleMembers.length;
                const targetAngle = randomIndex * segmentAngle;
                const spinRotations = 5;
                const finalRotation = spinRotations * 360 + (360 - targetAngle) + (segmentAngle / 2);
                
                setRotation(finalRotation);
                
                setTimeout(() => {
                    setIsSpinning(false);
                }, 5000);
            }
        } catch (err) {
            showToast({
                title: "Spin failed",
                description: err.message || "Failed to spin the lottery wheel.",
                variant: "error",
            });
            setIsSpinning(false);
        }
    };

    const handleSubmit = () => {
        if (onSubmit && winner) {
            onSubmit(winner);
        }
    };

    const handleCancel = () => {
        setWinner(null);
        setRotation(0);
        if (onCancel) {
            onCancel();
        }
    };

    const numSegments = eligibleMembers.length || 1;
    const segmentAngle = 360 / numSegments;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title="Lottery Wheel"
            description="Spin the wheel to select a winner from eligible members."
            footer={
                <div className="flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleCancel}
                        disabled={isSubmitting || isSpinning}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        disabled={isSubmitting || !winner || isSpinning}
                    >
                        Submit
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {isLoading ? (
                    <div className="p-8 text-center text-sm text-white/60">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-yellow-400 border-r-transparent"></div>
                        <p className="mt-3">Loading members...</p>
                    </div>
                ) : eligibleMembers.length === 0 ? (
                    <div className="p-8 text-center text-sm text-white/60">
                        <p>No eligible members found.</p>
                        <p className="mt-2 text-xs text-white/40">All members have completed their draws.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-6">
                        {/* Wheel Container */}
                        <div className="relative w-full max-w-md">
                            <div className="relative" style={{ paddingBottom: "100%" }}>
                                <div className="absolute inset-0">
                                    {/* Pointer */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                                        <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-yellow-400"></div>
                                        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-500 ml-[3px]"></div>
                                    </div>
                                    
                                    {/* Wheel */}
                                    <svg
                                        ref={wheelRef}
                                        className="absolute inset-0 w-full h-full"
                                        viewBox="0 0 400 400"
                                        style={{
                                            transform: `rotate(${rotation}deg)`,
                                            transition: isSpinning ? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                                        }}
                                    >
                                        <circle cx="200" cy="200" r="200" fill="none" />
                                        {eligibleMembers.map((member, index) => {
                                            const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
                                            const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
                                            const isEven = index % 2 === 0;
                                            
                                            const x1 = 200 + 200 * Math.cos(startAngle);
                                            const y1 = 200 + 200 * Math.sin(startAngle);
                                            const x2 = 200 + 200 * Math.cos(endAngle);
                                            const y2 = 200 + 200 * Math.sin(endAngle);
                                            
                                            const largeArc = segmentAngle > 180 ? 1 : 0;
                                            
                                            const name = member?.user?.name ?? member.memberName ?? "—";
                                            const id = member?.user?.id ?? member?.userId ?? member?.id ?? "—";
                                            
                                            // Text position (middle of segment)
                                            const textAngle = (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
                                            const textRadius = 100;
                                            const textX = 200 + textRadius * Math.cos(textAngle);
                                            const textY = 200 + textRadius * Math.sin(textAngle);
                                            
                                            
                                            return (
                                                <g key={`${id}-${index}`}>
                                                    <path
                                                        d={`M 200 200 L ${x1} ${y1} A 200 200 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                        fill={isEven ? "#ff6b6b" : "#ffffff"}
                                                        stroke="#1e293b"
                                                        strokeWidth="2"
                                                    />
                                                    {/* Name - displayed horizontally */}
                                                    <text
                                                        x={textX}
                                                        y={textY - 8}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        fill={isEven ? "#ffffff" : "#020617"}
                                                        fontSize="11"
                                                        fontWeight="bold"
                                                        className="select-none"
                                                        transform={`rotate(-30 ${textX} ${textY - 8})`}
                                                    >
                                                        {name.length > 12 ? name.substring(0, 12) + "..." : name}
                                                    </text>
                                                    {/* ID - displayed horizontally */}
                                                    <text
                                                        x={textX}
                                                        y={textY + 8}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        fill={isEven ? "#ffffff" : "#020617"}
                                                        fontSize="9"
                                                        className="select-none"
                                                        
                                                    >
                                                        {id}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                    
                                    {/* Center circle */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-900 rounded-full border-4 border-white/30 z-10 flex items-center justify-center shadow-lg">
                                        <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spin Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleSpin}
                            disabled={isSpinning || eligibleMembers.length === 0}
                            isLoading={isSpinning}
                            className="px-8 py-3 text-lg font-semibold"
                        >
                            {isSpinning ? "Spinning..." : "SPIN"}
                        </Button>

                        {/* Winner Display */}
                        {winner && !isSpinning && (
                            <div className="mt-4 p-4 rounded-lg border-2 border-yellow-400/50 bg-yellow-400/10 animate-pulse">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400/20 mb-2">
                                        <span className="text-2xl">🎉</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-yellow-300 uppercase tracking-wide mb-2">
                                        Winner!
                                    </h3>
                                    <div className="space-y-1 text-sm text-white/90">
                                        <p>
                                            <span className="font-semibold">Name:</span>{" "}
                                            {winner?.user?.name ?? winner.memberName ?? "—"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">ID:</span>{" "}
                                            {winner?.user?.id ?? winner?.userId ?? winner?.id ?? "—"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Phone:</span>{" "}
                                            {winner?.user?.phoneNo ?? winner?.phone ?? "—"}
                                        </p>
                                        {winner?.user?.email && (
                                            <p>
                                                <span className="font-semibold">Email:</span> {winner.user.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info */}
                        <p className="text-xs text-white/50 text-center">
                            {eligibleMembers.length} eligible member{eligibleMembers.length !== 1 ? "s" : ""} available
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
