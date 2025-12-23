import { useEffect, useMemo, useState, useRef } from "react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { getCommitteeMembers, getPaidAmountDrawWise, markUserDrawPaid, toggleDrawCompleted } from "../../services/apiClient.js";
import { useToast } from "../../context/ToastContext.jsx";

const formatDrawDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

const formatDrawTime = (value) => {
    if (!value) return "—";

    const normalize = () => {
        const timePattern = /^(\d{1,2}):?(\d{2})?:?(\d{2})?$/;
        const match = timePattern.exec(value);
        if (!match) return null;
        const [, rawHour, rawMinute, rawSecond] = match;
        return {
            hour: Number.parseInt(rawHour, 10),
            minute: Number.parseInt(rawMinute ?? rawSecond ?? "0", 10),
        };
    };

    let hourMinute = normalize();

    if (!hourMinute) {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            hourMinute = { hour: date.getHours(), minute: date.getMinutes() };
        }
    }

    if (!hourMinute) {
        return value;
    }

    let { hour, minute } = hourMinute;
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    const minuteStr = minute ? `:${minute.toString().padStart(2, "0")}` : "";

    return `${hour}${minuteStr}${period}`;
};

export function DrawMembersModal({
    isOpen,
    onClose,
    draw,
    committee,
    token,
    profile,
}) {
    
    const { showToast } = useToast();
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [payingMemberId, setPayingMemberId] = useState(null);
    const [togglingMemberId, setTogglingMemberId] = useState(null);
    const userRole = profile?.data?.role ?? profile?.role ?? "";
    const isAdmin = userRole === "ADMIN";
    const abortControllerRef = useRef(null);

    const loadMembers = () => {
        if (!committee?.id || !token || !draw?.id) {
            setMembers([]);
            setError("");
            return;
        }

        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsLoading(true);
        setError("");
        getPaidAmountDrawWise(token, committee.id, draw.id, { signal })
            .then((response) => {
                // Check if request was aborted
                if (signal.aborted) return;

                const membersList = Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response)
                        ? response
                        : [];
                        
                setMembers(membersList);
            })
            .catch((err) => {
                // Don't set error if request was aborted
                if (signal.aborted || err.name === "AbortError") return;

                setError(err.message || "Failed to load committee members.");
                setMembers([]);
            })
            .finally(() => {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            });
    };

    useEffect(() => {
        if (isOpen && committee?.id && token && draw?.id) {
            loadMembers();
        } else {
            setMembers([]);
            setError("");
        }

        // Cleanup: abort request on unmount or when dependencies change
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [isOpen, committee?.id, token, draw?.id]);

    const committeeName = committee?.committeeName ?? committee?.title ?? committee?.name ?? "Committee";
    
    const sanitizeAmount = (value) => {
        if (typeof value === "number") {
            return Number.isFinite(value) ? value : null;
        }
        if (typeof value === "string") {
            const numeric = Number(value.replace(/[^\d.-]/g, ""));
            return Number.isFinite(numeric) ? numeric : null;
        }
        return null;
    };

    const drawAmount =
        draw?.committeeDrawsAmount ??
        draw?.committeeDrawAmount ??
        draw?.amount ??
        "—";
    const minAmount =
        draw?.committeeDrawMinAmount ??
        draw?.minAmount ??
        draw?.minimumAmount ??
        "—";
    const formattedDate = formatDrawDate(
        draw?.committeeDrawDate ?? draw?.drawDate ?? draw?.date,
    );
    const formattedTime = formatDrawTime(
        draw?.committeeDrawTime ?? draw?.drawTime ?? draw?.time,
    );
    const defaultDrawAmountValue = useMemo(() => sanitizeAmount(drawAmount), [drawAmount]);
    const drawId = draw?.id ?? draw?.committeeDrawId ?? draw?.drawId;

    const handleToggleDrawCompleted = async (member) => {
        if (!committee?.id || !token || !drawId) {
            showToast({
                title: "Missing info",
                description: "Committee, draw, or authentication details are missing.",
                variant: "error",
            });
            return;
        }

        const userId = member?.user?.id ?? member?.userId ?? member?.id;
        if (!userId) {
            showToast({
                title: "Missing user",
                description: "Unable to determine the selected member's ID.",
                variant: "error",
            });
            return;
        }

        const currentStatus = member?.user?.drawCompleted ?? false;
        const newStatus = !currentStatus;

        setTogglingMemberId(userId);

        try {
            await toggleDrawCompleted(token, {
                committeeId: committee.id,
                drawId: drawId,
                userId: userId,
                isDrawCompleted: newStatus,
            });

            // Update local state optimistically
            setMembers((prevMembers) =>
                prevMembers.map((m) => {
                    const mUserId = m?.user?.id ?? m?.userId ?? m?.id;
                    if (mUserId === userId) {
                        return {
                            ...m,
                            user: {
                                ...m.user,
                                drawCompleted: newStatus,
                            },
                        };
                    }
                    return m;
                }),
            );

            showToast({
                title: "Status updated",
                description: `Draw completion status ${newStatus ? "marked" : "unmarked"} successfully.`,
                variant: "success",
            });
        } catch (error) {
            showToast({
                title: "Update failed",
                description: error.message || "Failed to update draw completion status.",
                variant: "error",
            });
        } finally {
            setTogglingMemberId(null);
        }
    };

    const handleMarkPaid = async (member) => {
        if (!committee?.id || !token || !drawId) {
            showToast({
                title: "Missing info",
                description: "Committee, draw, or authentication details are missing.",
                variant: "error",
            });
            return;
        }

        const userId = member?.user?.id ?? member?.userId ?? member?.id;
        if (!userId) {
            showToast({
                title: "Missing user",
                description: "Unable to determine the selected member's ID.",
                variant: "error",
            });
            return;
        }

        const amount = sanitizeAmount(
            member?.userDrawAmountPaid ??
                member?.drawAmount ??
                defaultDrawAmountValue,
        );

        if (!amount) {
            showToast({
                title: "Amount required",
                description: "Unable to determine an amount to mark as paid.",
                variant: "error",
            });
            return;
        }

        setPayingMemberId(userId);
        try {
          
            const response = await markUserDrawPaid(token, {
                committeeId: committee.id,
                userId,
                drawId,
                userDrawAmountPaid: amount,
            });
            
            showToast({
                title: "Payment recorded",
                // description: `Marked ₹${amount} as paid for ${member?.user?.name ?? "member"}.`,
                description: response?.message || "Payment recorded successfully.",
                variant: "success",
            });
            // Reload members list to show updated paid amounts
            loadMembers();
        } catch (requestError) {
            showToast({
                title: "Payment failed",
                description: requestError.message || "Unable to mark this draw as paid.",
                variant: "error",
            });
        } finally {
            setPayingMemberId(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Draw Details - ${committeeName}`}
            description={`Draw information and committee members list.`}
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="primary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Draw Information */}
                {draw && (
                    <div className="rounded-lg border border-white/10 bg-slate-950/30 p-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60 mb-4">
                            Draw Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                    Draw Date
                                </label>
                                <p className="text-sm text-white/90 font-medium">{formattedDate}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                    Draw Time
                                </label>
                                <p className="text-sm text-white/90 font-medium">{formattedTime}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                    Max Amount
                                </label>
                                <p className="text-sm text-white/90 font-medium">{minAmount}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                    Draw Amount
                                </label>
                                <p className="text-sm text-white/90 font-medium font-semibold">{drawAmount}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Members List */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60 mb-4">
                        Committee Members
                    </h3>
                    <div>
                        {isLoading ? (
                            <div className="p-8 text-center text-sm text-white/60">
                                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-yellow-400 border-r-transparent"></div>
                                <p className="mt-3">Loading members...</p>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center text-sm text-rose-200">
                                <p>{error}</p>
                                <Button
                                    variant="secondary"
                                    size="md"
                                    className="mt-4"
                                    onClick={loadMembers}
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="p-8 text-center text-sm text-white/60">
                                No members found for this committee.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="rounded-lg border border-white/10 bg-slate-950/30 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/80">
                                        <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                                            <tr>
                                                <th className="px-5 py-3 font-semibold">Name</th>
                                                <th className="px-5 py-3 font-semibold">Phone</th>
                                                <th className="px-5 py-3 font-semibold">Paid Amount</th>
                                                <th className="px-5 py-3 font-semibold">Final Amount</th>
                                                <th className="px-5 py-3 font-semibold">Total Paid Amount</th>
                                                <th className="px-5 py-3 font-semibold">Draw completed</th>
                                                {isAdmin && (
                                                    <th className="px-5 py-3 font-semibold text-right">Action</th>
                                                )}
                                                
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {members.map((member, index) => {
                                                const userId = member?.user?.id ?? member?.userId ?? member?.id;
                                                const phoneNo = member?.user?.phoneNo ?? member?.phone ?? "";
                                                // Create a unique key using userId, phoneNo, and index as fallback
                                                const uniqueKey = userId !== null && userId !== undefined 
                                                    ? `member-${userId}-${index}` 
                                                    : phoneNo 
                                                        ? `member-${phoneNo}-${index}` 
                                                        : `member-${index}`;
                                                
                                                return (
                                                    <tr key={uniqueKey} className="transition hover:bg-white/5">
                                                        <td className="px-5 py-4 font-semibold text-white">
                                                            {member?.user?.name ?? member.memberName ?? "—"}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {phoneNo || "—"}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {member?.user?.userDrawAmountPaid ?? "—"}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {member?.user?.fineAmountPaid ?? "—"}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {(Number(member?.user?.userDrawAmountPaid) || 0) + (Number(member?.user?.fineAmountPaid) || 0)}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleDrawCompleted(member)}
                                                                disabled={togglingMemberId === (member?.user?.id ?? member?.userId ?? member?.id)}
                                                                className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                                                    member?.isDrawCompleted
                                                                        ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                                                                        : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            >
                                                                {togglingMemberId === (member?.user?.id ?? member?.userId ?? member?.id)
                                                                    ? "Updating..."
                                                                    : member?.isDrawCompleted
                                                                    ? "Yes"
                                                                    : "No"}
                                                            </button>
                                                        </td>
                                                        {isAdmin && (
                                                            <td className="px-5 py-4 text-right">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                disabled={payingMemberId === userId}
                                                                onClick={() => handleMarkPaid(member)}
                                                            >
                                                                {payingMemberId === userId
                                                                    ? "Processing..."
                                                                    : "Mark Paid"}
                                                            </Button>
                                                        </td>
                                                        )}
                                                        
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs text-white/50 text-center">
                                    Total: {members.length} member{members.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

