import { useEffect, useState, useRef } from "react";
import { useToast } from "../context/ToastContext.jsx";
import { addCommitteeMember, getCommitteeDraws, updateDrawAmount } from "../services/apiClient.js";
import { Button } from "../components/ui/Button.jsx";
import { StatusBadge } from "../components/committee/StatusBadge.jsx";
import { AddCommitteeMemberModal } from "../components/committee/AddCommitteeMemberModal.jsx";
import { CommitteeMembersModal } from "../components/committee/CommitteeMembersModal.jsx";
import { DrawMembersModal } from "../components/committee/DrawMembersModal.jsx";

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

export default function CommitteeDetailsPage({ committee, token, onBack, onRefresh }) {
    const { showToast } = useToast();
    const [committeeDrawsList, setCommitteeDrawsList] = useState([]);
    const [isLoadingDraws, setIsLoadingDraws] = useState(false);
    const [drawsError, setDrawsError] = useState("");
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isGetMemberListModalOpen, setIsGetMemberListModalOpen] = useState(false);
    const [selectedDraw, setSelectedDraw] = useState(null);
    const [isDrawMemberModalOpen, setIsDrawMemberModalOpen] = useState(false);
    const [memberForm, setMemberForm] = useState({
        committeeId: "",
        name: "",
        phoneNo: "",
        email: "",
        password: "",
    });
    const [isMemberSubmitting, setIsMemberSubmitting] = useState(false);
    const [memberError, setMemberError] = useState("");
    const [editingDrawId, setEditingDrawId] = useState(null);
    const [editingAmount, setEditingAmount] = useState("");
    const [isUpdatingAmount, setIsUpdatingAmount] = useState(false);
    const debounceTimerRef = useRef(null);

    useEffect(() => {
        if (committee?.id && token) {
            loadCommitteeDraws();
        }
        
        // Cleanup debounce timer on unmount
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [committee?.id, token]);

    const loadCommitteeDraws = () => {
        if (!committee?.id || !token) return;
        
        setIsLoadingDraws(true);
        setDrawsError("");
        getCommitteeDraws(token, committee.id)
            .then((response) => {
                const committeeDrawsList = Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response)
                        ? response
                        : [];
                setCommitteeDrawsList(committeeDrawsList);
            })
            .catch((err) => {
                setDrawsError(err.message || "Failed to load committee draws.");
            })
            .finally(() => {
                setIsLoadingDraws(false);
            });
    };

    const resetMemberForm = () => {
        setMemberForm({
            committeeId: committee?.id ?? "",
            name: "",
            phoneNo: "",
            email: "",
            password: "",
        });
        setMemberError("");
    };

    const handleAddMember = () => {
        setMemberForm((current) => ({
            ...current,
            committeeId: committee?.id ?? "",
        }));
        setIsMemberModalOpen(true);
    };
    const handleGetMemberList = () => {
        setIsGetMemberListModalOpen(true);
    };

    const handleDrawAmountChange = (drawId, currentAmount) => {
        setEditingDrawId(drawId);
        setEditingAmount(currentAmount?.toString() || "");
    };

    const saveDrawAmount = async (draw, amount) => {
        const newAmount = Number.parseFloat(amount);
        const currentAmount = Number.parseFloat(
            draw?.committeeDrawsAmount ??
            draw?.committeeDrawAmount ??
            draw?.amount ??
            0
        );

        // If amount is invalid, don't save
        if (Number.isNaN(newAmount) || newAmount <= 0) {
            return;
        }

        // If amount hasn't changed, don't save
        if (newAmount === currentAmount) {
            return;
        }

        // Update the amount
        setIsUpdatingAmount(true);
        try {
            await updateDrawAmount(token, {
                committeeId: committee.id,
                drawId: draw.id,
                amount: newAmount,
            });
            
            showToast({
                title: "Amount updated",
                description: `Draw amount has been updated to ${newAmount}.`,
                variant: "success",
            });
            
            // Reload the draws list to get updated data
            loadCommitteeDraws();
        } catch (error) {
            const message = error.message || "Failed to update draw amount.";
            showToast({
                title: "Update failed",
                description: message,
                variant: "error",
            });
            // Reset to original value on error
            setEditingAmount(currentAmount.toString());
        } finally {
            setIsUpdatingAmount(false);
            setEditingDrawId(null);
        }
    };

    const handleDrawAmountInputChange = (e, draw) => {
        e.stopPropagation();
        const newValue = e.target.value;
        setEditingAmount(newValue);
        
        // Set editing mode if not already editing
        if (editingDrawId !== draw.id) {
            const currentAmount = 
                draw?.committeeDrawsAmount ??
                draw?.committeeDrawAmount ??
                draw?.amount ??
                "—";
            setEditingDrawId(draw.id);
            setEditingAmount(currentAmount?.toString() || "");
        }
        
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        // Set new timer to save after 4 seconds of inactivity
        debounceTimerRef.current = setTimeout(() => {
            saveDrawAmount(draw, newValue);
        }, 2000);
    };

    const handleDrawAmountBlur = async (draw) => {
        // Clear any pending debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        
        // Save immediately on blur
        if (editingDrawId === draw.id && editingAmount) {
            await saveDrawAmount(draw, editingAmount);
        }
    };

    const handleDrawAmountKeyDown = (event, draw) => {
        if (event.key === "Enter") {
            event.preventDefault();
            // Clear timer and save immediately
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
            handleDrawAmountBlur(draw);
        } else if (event.key === "Escape") {
            // Clear timer and cancel editing
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
            setEditingDrawId(null);
            setEditingAmount("");
        }
        // Prevent row click when interacting with input
        event.stopPropagation();
    };

    const handleDrawRowClick = (draw) => {
        setSelectedDraw(draw);
        setIsDrawMemberModalOpen(true);
    };

    const handleMemberSubmit = (event) => {
        event.preventDefault();

        if (!memberForm.committeeId) {
            setMemberError("Committee ID is required.");
            return;
        }
        if (!memberForm.phoneNo.trim() || !memberForm.name.trim()) {
            setMemberError("Member name and phone number are required.");
            return;
        }

        setIsMemberSubmitting(true);
        setMemberError("");

        addCommitteeMember(token, {
            committeeId: Number(memberForm.committeeId),
            phoneNo: memberForm.phoneNo.trim(),
            email: memberForm.email.trim() || undefined,
            password: memberForm.password || undefined,
            name: memberForm.name.trim(),
        })
            .then(() => {
                showToast({
                    title: "Member added",
                    description: "The member has been added to the committee.",
                    variant: "success",
                });
                setIsMemberModalOpen(false);
                resetMemberForm();
                loadCommitteeDraws();
                if (onRefresh) {
                    onRefresh();
                }
            })
            .catch((error) => {
                const message =
                    error.message ||
                    "Unable to add member. Please check the details.";
                setMemberError(message);
                showToast({
                    title: "Add member failed",
                    description: message,
                    variant: "error",
                });
            })
            .finally(() => {
                setIsMemberSubmitting(false);
            });
    };

    if (!committee) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-white">
                <div className="text-center">
                    <p className="text-white/60">No committee selected</p>
                    {onBack && (
                        <Button variant="secondary" onClick={onBack} className="mt-4">
                            Go Back
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    const committeeName = committee.committeeName ?? committee.title ?? committee.name ?? "Untitled Committee";
    const amount = committee.committeeAmount ?? committee.amount ?? committee.budget ?? "—";
    const maxMembers = committee.commissionMaxMember ?? committee.maxMembers ?? committee.members ?? "—";
    const noOfMonths = committee.noOfMonths ?? "—";
    const createdAt = committee.createdAt
        ? new Date(committee.createdAt).toLocaleString()
        : "—";
    const statusLabel = committee.committeeStatus ?? committee.status ?? committee.state ?? "INACTIVE";

    return (
        <div className="text-white px-4 py-6 sm:px-6 lg:px-12">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Back Button */}
                {onBack && (
                    <Button variant="ghost" onClick={onBack} className="mb-4">
                        ← Back to Committees
                    </Button>
                )}

                {/* Committee Details Card */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-lg shadow-black/30">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                                {committeeName}
                            </h1>
                            <p className="text-sm text-white/60 mt-2">
                                Committee details and member management
                            </p>
                        </div>
                        <StatusBadge status={statusLabel} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                Committee Amount
                            </label>
                            <p className="text-sm text-white/90 font-medium">{amount}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                Max Members
                            </label>
                            <p className="text-sm text-white/90 font-medium">{maxMembers}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                Number of Months
                            </label>
                            <p className="text-sm text-white/90 font-medium">{noOfMonths}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                Created Date
                            </label>
                            <p className="text-sm text-white/90 font-medium">{createdAt}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                Committee ID
                            </label>
                            <p className="text-sm text-white/90 font-medium">{committee.id ?? "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Members Section */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Committee Draw List</h2>
                            <p className="text-sm text-white/60 mt-1">
                                {committeeDrawsList.length} draw{committeeDrawsList.length !== 1 ? "s" : ""} recorded for this committee
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="secondary" onClick={handleGetMemberList}>
                                Get member list
                            </Button>
                            <Button variant="primary" onClick={handleAddMember}>
                                Add Member
                            </Button>
                        </div>
                    </div>

                    {isLoadingDraws ? (
                        <div className="p-8 text-center text-sm text-white/60">
                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-yellow-400 border-r-transparent"></div>
                            <p className="mt-3">Loading draw list...</p>
                        </div>
                    ) : drawsError ? (
                        <div className="p-8 text-center text-sm text-rose-200">
                            <p>{drawsError}</p>
                            <Button
                                variant="secondary"
                                size="md"
                                className="mt-4"
                                onClick={loadCommitteeDraws}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : committeeDrawsList.length === 0 ? (
                        <div className="p-8 text-center text-sm text-white/60">
                            <p>No committee draws found for this committee.</p>
                            <p>Please add a committee member and complete the committee member list then draw list will be shown here.</p>
                            {/* <Button
                                variant="primary"
                                size="md"
                                className="mt-4"
                                onClick={handleAddMember}
                            >
                                Add First Member
                            </Button> */}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/30">
                            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/80">
                                <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">S.No</th>
                                        <th className="px-5 py-3 font-semibold">Draw Date</th>
                                        <th className="px-5 py-3 font-semibold">Draw Time</th>
                                        <th className="px-5 py-3 font-semibold">Min Amount</th>
                                        <th className="px-5 py-3 font-semibold">Draw Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {committeeDrawsList.map((draw, index) => {
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

                                        const isEditing = editingDrawId === draw.id;
                                        const displayAmount = isEditing ? editingAmount : drawAmount;
                                        
                                        // Initialize editing amount if not set
                                        const handleInputFocus = (e, draw) => {
                                            e.stopPropagation();
                                            if (editingDrawId !== draw.id) {
                                                const currentAmount = 
                                                    draw?.committeeDrawsAmount ??
                                                    draw?.committeeDrawAmount ??
                                                    draw?.amount ??
                                                    "—";
                                                setEditingDrawId(draw.id);
                                                setEditingAmount(currentAmount?.toString() || "");
                                            }
                                        };

                                        return (
                                            <tr 
                                                key={draw.id ?? index} 
                                                className="transition hover:bg-white/5 cursor-pointer"
                                                onClick={() => handleDrawRowClick(draw)}
                                            >
                                                <td className="px-5 py-4 text-white/80">
                                                    {index + 1}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {formattedTime}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {minAmount}
                                                </td>
                                                <td className="px-5 py-4 font-semibold text-white">
                                                    <input
                                                        className="w-24 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        name="drawAmount"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={displayAmount}
                                                        onChange={(e) => handleDrawAmountInputChange(e, draw)}
                                                        onBlur={(e) => {
                                                            e.stopPropagation();
                                                            handleDrawAmountBlur(draw);
                                                        }}
                                                        onKeyDown={(e) => handleDrawAmountKeyDown(e, draw)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onFocus={(e) => handleInputFocus(e, draw)}
                                                        disabled={isUpdatingAmount}
                                                        placeholder="Amount"
                                                    />
                                                </td>
                                                
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Member Modal */}
            <AddCommitteeMemberModal
                isOpen={isMemberModalOpen}
                token={token}
                onClose={() => {
                    if (!isMemberSubmitting) {
                        setIsMemberModalOpen(false);
                        resetMemberForm();
                    }
                }}
                form={memberForm}
                onChange={(event) => {
                    const { name, value } = event.target;
                    setMemberForm((current) => ({
                        ...current,
                        [name]: value,
                    }));
                }}
                onSubmit={handleMemberSubmit}
                isSubmitting={isMemberSubmitting}
                error={memberError}
            />
            <CommitteeMembersModal
                isOpen={isGetMemberListModalOpen}
                onClose={() => setIsGetMemberListModalOpen(false)}
                token={token}
                committee={committee}
            />
            
            {/* Draw Members Modal */}
            <DrawMembersModal
                isOpen={isDrawMemberModalOpen}
                onClose={() => {
                    setIsDrawMemberModalOpen(false);
                    setSelectedDraw(null);
                }}
                draw={selectedDraw}
                token={token}
                committee={committee}
            />
        </div>
    );
}

