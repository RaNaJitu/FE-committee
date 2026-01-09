import { useEffect, useState, useRef } from "react";
import { useToast } from "../context/ToastContext.jsx";
import { addCommitteeMember, getCommitteeDraws, updateDrawAmount, getCommitteeMembers, getCommitteeAnalysis, getLotteryRandomUser } from "../services/apiClient.js";
import { Button } from "../components/ui/Button.jsx";
import { StatusBadge } from "../components/committee/StatusBadge.jsx";
import { AddCommitteeMemberModal } from "../components/committee/AddCommitteeMemberModal.jsx";
import { CommitteeMembersModal } from "../components/committee/CommitteeMembersModal.jsx";
import { DrawMembersModal } from "../components/committee/DrawMembersModal.jsx";
import { DrawTimerModal } from "../components/committee/DrawTimerModal.jsx";
import { LotteryResultModal } from "../components/committee/LotteryResultModal.jsx";
import { LotteryWheelModal } from "../components/committee/LotteryWheelModal.jsx";

export const formatDrawDate = (value) => {
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

export const formatDrawTime = (value) => {
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

export default function CommitteeDetailsPage({ committee, token, profile, onBack, onRefresh }) {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState("members");
    const [committeeDrawsList, setCommitteeDrawsList] = useState([]);
    const [isLoadingDraws, setIsLoadingDraws] = useState(false);
    const [drawsError, setDrawsError] = useState("");
    const [membersList, setMembersList] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [membersError, setMembersError] = useState("");
    const [analysisData, setAnalysisData] = useState(null);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [analysisError, setAnalysisError] = useState("");
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
    const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
    const [timerDraw, setTimerDraw] = useState(null);
    const [isLotteryModalOpen, setIsLotteryModalOpen] = useState(false);
    const [lotteryResult, setLotteryResult] = useState(null);
    const [isLoadingLottery, setIsLoadingLottery] = useState(false);
    const [isSubmittingLottery, setIsSubmittingLottery] = useState(false);
    const debounceTimerRef = useRef(null);

    const [idDevelopmentMode, setIdDevelopmentMode] = useState(false);

    

    useEffect(() => {
        if (committee?.id && token) {
            if (activeTab === "draws") {
                loadCommitteeDraws();
            } else if (activeTab === "members") {
                loadCommitteeMembers();
            } else if (activeTab === "analysis") {
                loadCommitteeAnalysis();
            }
        }
        
        console.log( "NODE_ENV: ===>", process.env.NODE_ENV);
        if(process.env.NODE_ENV === "PRODUCTION");
        setIdDevelopmentMode(true);
        // Cleanup debounce timer on unmount
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [committee?.id, token, activeTab]);

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

    const loadCommitteeMembers = () => {
        if (!committee?.id || !token) return;
        
        setIsLoadingMembers(true);
        setMembersError("");
        getCommitteeMembers(token, committee.id)
            .then((response) => {
                const members = Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response)
                        ? response
                        : [];
                setMembersList(members);
            })
            .catch((err) => {
                setMembersError(err.message || "Failed to load committee members.");
            })
            .finally(() => {
                setIsLoadingMembers(false);
            });
    };

    const loadCommitteeAnalysis = () => {
        if (!committee?.id || !token) return;
        
        setIsLoadingAnalysis(true);
        setAnalysisError("");
        getCommitteeAnalysis(token, committee.id)
            .then((response) => {
                // Handle different response structures
                const data = response?.data ?? response ?? null;
                setAnalysisData(data);
            })
            .catch((err) => {
                setAnalysisError(err.message || "Failed to load committee analysis.");
                setAnalysisData(null);
            })
            .finally(() => {
                setIsLoadingAnalysis(false);
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

    const handleStartLotteryDraw = async (draw = null) => {
        if (!committee?.id || !token) {
            showToast({
                title: "Error",
                description: "Committee ID or authentication token is missing.",
                variant: "error",
            });
            return;
        }

        // Store the draw for the lottery modal if provided
        if (draw) {
            setSelectedDraw(draw);
        }
        
        setIsLoadingLottery(true);
        setLotteryResult(null);
        setIsLotteryModalOpen(true);

        // Call the lottery API
        try {
            const response = await getLotteryRandomUser(token, committee.id);
            const result = response?.data ?? response ?? null;
            setLotteryResult(result);
            
            // Keep loading state for 5 seconds to allow scrolling animation to complete
            // The modal will handle showing the result immediately after animation
            setTimeout(() => {
                setIsLoadingLottery(false);
            }, 5000);
        } catch (err) {
            showToast({
                title: "Failed to get lottery winner",
                description: err.message || "Unable to fetch lottery result.",
                variant: "error",
            });
            setLotteryResult(null);
            setIsLoadingLottery(false);
        }
    };

    const handleLotterySubmit = () => {
        setIsSubmittingLottery(true);
        // Here you can add any additional logic when submitting the lottery result
        // For example, saving the result or triggering a refresh
        setTimeout(() => {
            showToast({
                title: "Lottery Draw Completed",
                description: "The lottery draw has been successfully recorded.",
                variant: "success",
            });
            setIsSubmittingLottery(false);
            setIsLotteryModalOpen(false);
            setLotteryResult(null);
            // Refresh the draws list if needed
            if (onRefresh) {
                onRefresh();
            }
            loadCommitteeDraws();
        }, 500);
    };

    const handleLotteryCancel = () => {
        setIsLotteryModalOpen(false);
        setLotteryResult(null);
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
                loadCommitteeMembers();
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
    const startDate = committee.startCommitteeDate
        ? new Date(committee.startCommitteeDate).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        })
        : "—";
    const committeeType = committee.committeeType ?? committee.type ?? "—";
    const statusLabel = committee.committeeStatus ?? committee.status ?? committee.state ?? "INACTIVE";
    const userRole = profile?.data?.role ?? profile?.role ?? "";
    const isAdmin = userRole === "ADMIN";
    
    // Get first letter of committee name for avatar
    const avatarLetter = committeeName.charAt(0).toUpperCase();

    return (
        <div className="text-white mt-12">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 mt-8">
                {/* Committee Info Card with Header Over Border */}
                <div className="relative mt-2 sm:mt-4">
                    {/* Header positioned over the border */}
                    <div className="absolute -top-2.5 sm:-top-3 left-3 sm:left-4 md:left-6 z-10  ">
                        <span className="bg-slate-950 px-2 sm:px-3 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white">
                            Committee details
                        </span>
                    </div>
                    
                    {/* Committee Info Card */}
                    <div className="rounded-xl sm:rounded-2xl border border-white/10 p-10 md:top-24 ">
                        {/* Status Badge - Top Right */}
                        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6">
                            <StatusBadge status={statusLabel} />
                        </div>
                        
                        <div className="flex items-start gap-4 sm:gap-5 pr-20 sm:pr-24">
                            {/* Avatar */}
                            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-900/80 flex items-center justify-center border border-purple-700/50 shadow-lg">
                                <span className="text-2xl sm:text-3xl font-bold text-white">{avatarLetter}</span>
                            </div>
                            
                            {/* Committee Info */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 break-words">
                                    {committeeName}
                                </h2>
                                <div className="flex justify-between gap-1 text-sm sm:text-base text-white/95">
                                    {/* <span>Start: {startDate}</span> */}
                                    <span>Committee Type: {committeeType}</span>
                                    <span>Amount: {typeof amount === "number" ? amount.toLocaleString() : amount}</span>
                                    <span>Max Members: {maxMembers}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 sm:gap-2 border-b border-white/10 overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
                    <button
                        onClick={() => setActiveTab("members")}
                        className={`px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-t-lg transition whitespace-nowrap flex-shrink-0 ${
                            activeTab === "members"
                                ? "bg-yellow-400 text-slate-900 font-semibold"
                                : "text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        Members
                    </button>
                    <button
                        onClick={() => setActiveTab("draws")}
                        className={`px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-t-lg transition whitespace-nowrap flex-shrink-0 ${
                            activeTab === "draws"
                                ? "bg-yellow-400 text-slate-900 font-semibold"
                                : "text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        Committee Draw
                    </button>
                    <button
                        onClick={() => setActiveTab("analysis")}
                        className={`px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-t-lg transition whitespace-nowrap flex-shrink-0 ${
                            activeTab === "analysis"
                                ? "bg-yellow-400 text-slate-900 font-semibold"
                                : "text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        Analysis
                    </button>
                </div>

                {/* Tab Content */}
                <div className="rounded-xl sm:rounded-2xl md:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 md:p-6 shadow-lg shadow-black/30">
                    {activeTab === "draws" && (
                        <>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Committee Draw List</h2>
                                    <p className="text-sm text-white/60 mt-1">
                                        {committeeDrawsList.length} draw{committeeDrawsList.length !== 1 ? "s" : ""} recorded for this committee
                                    </p>
                                    
                                </div>
                                {/* <div className="flex flex-wrap gap-3">
                                    <Button variant="secondary" onClick={handleGetMemberList}>
                                        Get member list
                                    </Button>
                                    <Button variant="primary" onClick={handleAddMember}>
                                        Add Member
                                    </Button>
                                </div> */}
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
                                        <th className="px-5 py-3 font-semibold">Max Amount</th>
                                        <th className="px-5 py-3 font-semibold">Draw Amount</th>
                                        {isAdmin && committee.committeeType !== "LOTTERY" && (
                                            <th className="px-5 py-3 font-semibold text-center">Timer</th>
                                        )}
                                        {isAdmin && committee.committeeType === "LOTTERY" && (
                                            <th className="px-5 py-3 font-semibold text-center">Action</th>
                                        )}
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
                                        const rawDate = draw?.committeeDrawDate ?? draw?.drawDate ?? draw?.date;
                                        const rawTime = draw?.committeeDrawTime ?? draw?.drawTime ?? draw?.time;
                                        const formattedDate = formatDrawDate(rawDate);
                                        const formattedTime = formatDrawTime(rawTime);

                                        // Determine if the current time is after the draw's scheduled date & time
                                        let canOpenTimer = false;
                                        let isDrawStarted = false;
                                        if (rawDate) {
                                            const startDate = new Date(rawDate);
                                            if (!Number.isNaN(startDate.getTime())) {
                                                if (rawTime && typeof rawTime === "string") {
                                                    const match = /^(\d{1,2}):?(\d{2})?:?(\d{2})?/.exec(rawTime);
                                                    if (match) {
                                                        const [, h, m, s] = match;
                                                        startDate.setHours(
                                                            Number.parseInt(h ?? "0", 10),
                                                            Number.parseInt(m ?? "0", 10),
                                                            Number.parseInt(s ?? "0", 10),
                                                            0,
                                                        );
                                                    }
                                                }
                                                const now = new Date();
                                                canOpenTimer = now >= startDate;
                                                isDrawStarted = now >= startDate;
                                            }
                                        }

                                        // Check if draw is completed
                                        const isDrawCompleted = 
                                            draw?.isDrawCompleted === true || 
                                            draw?.drawStatus === "COMPLETED" || 
                                            draw?.status === "COMPLETED" ||
                                            draw?.isCompleted === true;

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
                                                <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-white/80 whitespace-nowrap">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap">
                                                    {formattedTime}
                                                </td>
                                                <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap">
                                                    {minAmount}
                                                </td>
                                                {isAdmin ? (
                                                    <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 font-semibold text-white">
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
                                                ) : (
                                                    <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 font-semibold text-white whitespace-nowrap">
                                                        {drawAmount}
                                                    </td>
                                                )}
                                                {isAdmin && committee.committeeType !== "LOTTERY" && (
                                                    <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-center">
                                                        {canOpenTimer ? (
                                                            <Button
                                                                variant="secondary"
                                                                size="md"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setTimerDraw(draw);
                                                                    setIsTimerModalOpen(true);
                                                                }}
                                                            >
                                                                Open Timer
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs font-medium text-white/40 italic">
                                                                Draw not started yet
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                                {isAdmin && committee.committeeType === "LOTTERY" && (
                                                    <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-center">
                                                        {isDrawStarted ? (
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStartLotteryDraw();
                                                                }}
                                                                disabled={isDrawCompleted}
                                                            >
                                                                Start Lottery Draw
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs font-medium text-white/40 italic">
                                                                Draw not started yet
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
                    )}

                    {activeTab === "members" && (
                        <>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-base sm:text-lg font-semibold text-white">Committee Members</h2>
                                    <p className="text-xs sm:text-sm text-white/60 mt-0.5 sm:mt-1">
                                        {membersList.length} member{membersList.length !== 1 ? "s" : ""} in this committee
                                    </p>
                                </div>
                                {isAdmin && (
                                    <Button variant="primary" onClick={handleAddMember} className="w-full sm:w-auto flex-shrink-0">
                                        Add Member
                                    </Button>
                                )}
                            </div>

                            {isLoadingMembers ? (
                                <div className="p-8 text-center text-sm text-white/60">
                                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-yellow-400 border-r-transparent"></div>
                                    <p className="mt-3">Loading members...</p>
                                </div>
                            ) : membersError ? (
                                <div className="p-8 text-center text-sm text-rose-200">
                                    <p>{membersError}</p>
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        className="mt-4"
                                        onClick={loadCommitteeMembers}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : membersList.length === 0 ? (
                                <div className="p-8 text-center text-sm text-white/60">
                                    <p>No members found for this committee.</p>
                                    <Button
                                        variant="primary"
                                        size="md"
                                        className="mt-4"
                                        onClick={handleAddMember}
                                    >
                                        Add First Member
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-white/10 bg-slate-950/30 -mx-4 sm:mx-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                                    <table className="min-w-full divide-y divide-white/10 text-left text-xs sm:text-sm text-white/80">
                                        <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                                            <tr>
                                                <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 font-semibold whitespace-nowrap">S.No</th>
                                                {/* {idDevelopmentMode && (
                                                    <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 font-semibold whitespace-nowrap">User Id</th>
                                                )} */}
                                                <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 font-semibold whitespace-nowrap">Name</th>
                                                <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 font-semibold whitespace-nowrap">Phone</th>
                                                <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 font-semibold whitespace-nowrap">Email</th>
                                                <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 font-semibold whitespace-nowrap">draw completed</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {membersList.map((member, index) => (
                                                <tr key={member.id ?? index} className="transition hover:bg-white/5">
                                                    <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-white/80 whitespace-nowrap">
                                                        {index + 1}
                                                    </td>
                                                    {/* {idDevelopmentMode && (
                                                    <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap">
                                                        {member?.user?.id ?? member.userId ?? member.id ?? "—"}
                                                    </td>
                                                    )} */}
                                                    <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 font-semibold text-white">
                                                        <span className="truncate block max-w-[120px] sm:max-w-none">{member?.user?.name ?? member.memberName ?? member.name ?? "—"}</span>
                                                    </td>
                                                    <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap">
                                                        {member?.user?.phoneNo ?? member.phone ?? member.phoneNo ?? "—"}
                                                    </td>
                                                    <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3">
                                                        <span className="truncate block max-w-[150px] sm:max-w-none">{member?.user?.email ?? member.email ?? "—"}</span>
                                                    </td>
                                                    <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3">
                                                        <button
                                                            type="button"
                                                            className={`inline-flex items-center rounded-md px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium transition whitespace-nowrap ${
                                                                member?.user?.isUserDrawCompleted
                                                                    ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                                                                    : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        >
                                                            {member?.user?.isUserDrawCompleted
                                                                ? "Yes"
                                                                : "No"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "analysis" && (
                        <>
                            {isLoadingAnalysis ? (
                                <div className="p-8 text-center text-sm text-white/60">
                                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-yellow-400 border-r-transparent"></div>
                                    <p className="mt-3">Loading analysis...</p>
                                </div>
                            ) : analysisError ? (
                                <div className="p-8 text-center text-sm text-rose-200">
                                    <p>{analysisError}</p>
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        className="mt-4"
                                        onClick={loadCommitteeAnalysis}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : analysisData ? (
                                <div className="rounded-2xl">
                                {/* <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 shadow-lg shadow-black/30"> */}
                                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Analysis</h2>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        {/* Total members */}
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-white/70">Total members</label>
                                            <p className="text-lg font-semibold text-white">
                                                {analysisData?.analysis?.totalMembers ?? 
                                                 analysisData?.analysis?.total_members ?? 
                                                 analysisData?.analysis?.totalMembersCount ??
                                                 analysisData?.analysis?.members ??
                                                 "—"}
                                            </p>
                                        </div>

                                        {/* Total amount */}
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-white/70">Total amount</label>
                                            <p className="text-lg font-semibold text-white">
                                                {(() => {
                                                    const amount = analysisData?.analysis?.totalCommitteeAmount 
                                                    if (amount === null || amount === undefined) return "—";
                                                    const numAmount = typeof amount === "number" ? amount : Number.parseFloat(amount);
                                                    return isNaN(numAmount) ? "—" : `₹${numAmount.toLocaleString("en-IN")}`;
                                                })()}
                                            </p>
                                        </div>

                                        {/* Paid amount */}
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-white/70">Paid amount</label>
                                            <p className="text-lg font-semibold text-white">
                                                {(() => {
                                                    const amount = analysisData?.analysis?.totalCommitteePaidAmount;
                                                    if (amount === null || amount === undefined) return "—";
                                                    const numAmount = typeof amount === "number" ? amount : Number.parseFloat(amount);
                                                    return isNaN(numAmount) ? "—" : `₹${numAmount.toLocaleString("en-IN")}`;
                                                })()}
                                            </p>
                                        </div>

                                        {/* Fine amount */}
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-white/70">Fine amount</label>
                                            <p className="text-lg font-semibold text-white">
                                                {(() => {
                                                    const amount = analysisData?.analysis?.totalCommitteeFineAmount;
                                                    if (amount === null || amount === undefined) return "—";
                                                    const numAmount = typeof amount === "number" ? amount : Number.parseFloat(amount);
                                                    return isNaN(numAmount) ? "—" : `₹${numAmount.toLocaleString("en-IN")}`;
                                                })()}
                                            </p>
                                        </div>

                                        {/* Draws completed */}
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-sm font-medium text-white/70">Draws completed</label>
                                            <p className="text-lg font-semibold text-white">
                                                {(() => {
                                                    const completed = analysisData?.analysis?.noOfDrawsCompleted;
                                                    const total = analysisData?.analysis?.totalDraws;
                                                    
                                                    if (completed === null || completed === undefined) {
                                                        return total !== null && total !== undefined ? `0/${total}` : "—";
                                                    }
                                                    
                                                    const completedNum = typeof completed === "number" ? completed : Number.parseInt(completed, 10);
                                                    const totalNum = total !== null && total !== undefined 
                                                        ? (typeof total === "number" ? total : Number.parseInt(total, 10))
                                                        : null;
                                                    
                                                    if (isNaN(completedNum)) return "—";
                                                    return totalNum !== null && !isNaN(totalNum) 
                                                        ? `${completedNum}/${totalNum}` 
                                                        : String(completedNum);
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-sm text-white/60">
                                    <p>No analysis data available.</p>
                                </div>
                            )}
                        </>
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
                profile={profile}
            />
            <DrawTimerModal
                isOpen={isTimerModalOpen}
                onClose={() => {
                    setIsTimerModalOpen(false);
                    setTimerDraw(null);
                }}
                draw={timerDraw}
                committeeName={committeeName}
            />
            
            {/* Lottery Result Modal */}
            <LotteryResultModal
                isOpen={isLotteryModalOpen}
                onClose={handleLotteryCancel}
                lotteryResult={lotteryResult}
                isLoading={isLoadingLottery}
                onSubmit={handleLotterySubmit}
                onCancel={handleLotteryCancel}
                isSubmitting={isSubmittingLottery}
                membersList={membersList}
            />

            {/* Lottery Wheel Modal */}
            {/* <LotteryWheelModal
                isOpen={isLotteryModalOpen}
                onClose={handleLotteryCancel}
                committee={committee}
                token={token}
                onSubmit={handleLotterySubmit}
                onCancel={handleLotteryCancel}
                isSubmitting={isSubmittingLottery}
            /> */}
        </div>
    );
}

