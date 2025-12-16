import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import { useCommittees } from "../hooks/useCommittees.js";
import { useToast } from "../context/ToastContext.jsx";
import { createCommittee, getCommittees } from "../services/apiClient.js";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { MobileSidebar } from "../components/layout/MobileSidebar.jsx";
import { DashboardHeader } from "../components/layout/DashboardHeader.jsx";
import { CommitteeTable } from "../components/committee/CommitteeTable.jsx";
import { CreateCommitteeModal } from "../components/committee/CreateCommitteeModal.jsx";
import ProfilePage from "./ProfilePage.jsx";
import CalendarPage from "./CalendarPage.jsx";
import CommitteeDetailsPage from "./CommitteeDetailsPage.jsx";
import { navigation } from "../constants/navigation.js";

export default function DashboardPage({ token, profile, onLogout }) {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    
    // Get active nav from URL path
    const activeNav = location.pathname.includes("/profile")
        ? "profile"
        : location.pathname.includes("/calendar")
        ? "calendar"
        : location.pathname.includes("/committee/")
        ? "committees"
        : "committees";
    const {
        committees,
        meta,
        status,
        isLoading,
        isError,
        error,
        refresh,
    } = useCommittees({ token, enabled: true });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        committeeName: "",
        commissionMaxMember: "",
        committeeAmount: "",
        noOfMonths: "",
        startCommitteeDate: "",
        fineAmount: "",
        extraDaysForFine: "",
    });
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    useEffect(() => {
        if (isError && error) {
            showToast({
                title: "Failed to load committees",
                description: error.message ?? "Please try again later.",
                variant: "error",
            });
        }
    }, [isError, error, showToast]);

    const handleCreateChange = (event) => {
        const { name, value } = event.target;
        setCreateForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const resetCreateForm = () => {
        setCreateForm({
            committeeName: "",
            commissionMaxMember: "",
            committeeAmount: "",
            noOfMonths: "",
            startCommitteeDate: "",
            fineAmount: "",
            extraDaysForFine: "",
        });
        setCreateError("");
    };


    const handleCreateSubmit = (event) => {
        event?.preventDefault?.();
        if (!token) {
            setCreateError("Missing authentication token.");
            return;
        }
        const name = createForm.committeeName.trim();
        if (!name) {
            setCreateError("Please provide a committee name.");
            return;
        }

        const maxMembers = Number.parseInt(createForm.commissionMaxMember, 10);
        if (Number.isNaN(maxMembers) || maxMembers <= 0) {
            setCreateError("Please enter a valid maximum member count.");
            return;
        }

        const amount = Number.parseFloat(createForm.committeeAmount);
        if (Number.isNaN(amount) || amount <= 0) {
            setCreateError("Please enter a valid committee amount.");
            return;
        }

        const noOfMonths = Number.parseInt(createForm.noOfMonths, 10);
        if (Number.isNaN(noOfMonths) || noOfMonths <= 0) {
            setCreateError("Please enter a valid number of months.");
            return;
        }

        const startCommitteeDate = createForm.startCommitteeDate.trim();
        if (!startCommitteeDate) {
            setCreateError("Please select a start committee date.");
            return;
        }

        // Validate date format (ISO format: 2026-01-01T12:39:43.495Z)
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        if (!isoDateRegex.test(startCommitteeDate)) {
            setCreateError("Please select a valid start committee date.");
            return;
        }

        const selectedDate = new Date(startCommitteeDate);
        if (isNaN(selectedDate.getTime())) {
            setCreateError("Please select a valid start committee date.");
            return;
        }

        // Validate date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateOnly = new Date(selectedDate);
        selectedDateOnly.setHours(0, 0, 0, 0);
        if (selectedDateOnly < today) {
            setCreateError("Start committee date must be today or a future date.");
            return;
        }

        const fineAmount = Number.parseFloat(createForm.fineAmount);
        if (Number.isNaN(fineAmount) || fineAmount < 0) {
            setCreateError("Please enter a valid fine amount (must be 0 or greater).");
            return;
        }

        const extraDaysForFine = Number.parseInt(createForm.extraDaysForFine, 10);
        if (Number.isNaN(extraDaysForFine) || extraDaysForFine < 0) {
            setCreateError("Please enter a valid number of extra days for fine (must be 0 or greater).");
            return;
        }

        setIsCreating(true);
        setCreateError("");
        setIsCreateOpen(false);

        const payload = {
            committeeName: name,
            commissionMaxMember: maxMembers,
            committeeAmount: amount,
            noOfMonths: noOfMonths,
            startCommitteeDate: startCommitteeDate,
            fineAmount: fineAmount,
            extraDaysForFine: extraDaysForFine,
        };

        createCommittee(token, payload)
            .then((result) => {
                showToast({
                    title: "Committee created",
                    description:
                        result?.committeeName
                            ? `"${result.committeeName}" is now available in the list.`
                            : "The committee has been created successfully.",
                    variant: "success",
                });
                refresh();
            })
            .catch((error) => {
                const message =
                    error.message ??
                    "Unable to create committee. Please try again.";
                setCreateError(message);
                showToast({
                    title: "Creation failed",
                    description: message,
                    variant: "error",
                });
            })
            .finally(() => {
                setIsCreating(false);
                resetCreateForm();
            });
    };

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            <Sidebar activeNav={activeNav} />
            <MobileSidebar
                isOpen={isMobileNavOpen}
                onClose={() => setIsMobileNavOpen(false)}
                activeNav={activeNav}
            />
            <main className="flex-1 overflow-hidden xl:ml-72">
                <Routes>
                    <Route
                        path="profile"
                        element={
                            <ProfilePage
                                token={token}
                                profile={profile}
                                onBack={() => navigate("/dashboard")}
                            />
                        }
                    />
                    <Route
                        path="committee/:committeeId"
                        element={<CommitteeDetailsRoute token={token} profile={profile} onRefresh={refresh} />}
                    />
                    <Route
                        path="calendar"
                        element={
                            <>
                                <DashboardHeader
                                    profile={profile}
                                    token={token}
                                    onOpenMobileNav={() => setIsMobileNavOpen(true)}
                                    onViewProfile={() => navigate("/dashboard/profile")}
                                    onLogout={onLogout}
                                />
                                <div className="pt-32 px-6 py-8 lg:px-12">
                                    <CalendarPage />
                                </div>
                            </>
                        }
                    />
                    <Route
                        path=""
                        element={
                            <>
                                <DashboardHeader
                                    profile={profile}
                                    token={token}
                                    onOpenMobileNav={() => setIsMobileNavOpen(true)}
                                    onViewProfile={() => navigate("/dashboard/profile")}
                                    onLogout={onLogout}
                                />
                                <div className="pt-32 px-6 py-8 lg:px-12">
                                    <CommitteeTable
                                        committees={committees}
                                        meta={meta}
                                        isLoading={isLoading}
                                        isError={isError}
                                        error={error}
                                        onRefresh={refresh}
                                        onCreate={() => setIsCreateOpen(true)}
                                        canCreate={profile?.data?.role === "ADMIN"}
                                        onViewCommittee={(committee) => {
                                            navigate(`/dashboard/committee/${committee.id}`);
                                        }}
                                    />
                                </div>
                            </>
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <>
                                <DashboardHeader
                                    profile={profile}
                                    token={token}
                                    onOpenMobileNav={() => setIsMobileNavOpen(true)}
                                    onViewProfile={() => navigate("/dashboard/profile")}
                                    onLogout={onLogout}
                                />
                                <div className="pt-32 px-6 py-8 lg:px-12">
                                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                                        <p className="text-white/60">Page not found.</p>
                                    </div>
                                </div>
                            </>
                        }
                    />
                </Routes>
            </main>
            <CreateCommitteeModal
                isOpen={isCreateOpen}
                onClose={() => {
                    if (!isCreating) {
                        setIsCreateOpen(false);
                        resetCreateForm();
                    }
                }}
                form={createForm}
                onChange={handleCreateChange}
                onSubmit={handleCreateSubmit}
                isSubmitting={isCreating}
                error={createError}
            />
        </div>
    );
}

// Component to handle committee details route
function CommitteeDetailsRoute({ token, profile, onRefresh }) {
    const { committeeId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [committee, setCommittee] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!committeeId || !token) {
            navigate("/dashboard");
            return;
        }

        setIsLoading(true);
        getCommittees(token)
            .then((response) => {
                const committeesList = Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response)
                        ? response
                        : [];
                const found = committeesList.find((c) => c.id === Number(committeeId));
                if (found) {
                    setCommittee(found);
                } else {
                    showToast({
                        title: "Committee not found",
                        description: "The requested committee could not be found.",
                        variant: "error",
                    });
                    navigate("/dashboard");
                }
            })
            .catch((error) => {
                showToast({
                    title: "Failed to load committee",
                    description: error.message || "Please try again later.",
                    variant: "error",
                });
                navigate("/dashboard");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [committeeId, token, navigate, showToast]);

    if (isLoading) {
        return (
            <>
                <DashboardHeader
                    profile={profile}
                    token={token}
                    onOpenMobileNav={() => {}}
                    onViewProfile={() => navigate("/dashboard/profile")}
                    onLogout={() => {}}
                />
                <div className="pt-32 px-6 py-8 lg:px-12">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-yellow-400 border-r-transparent"></div>
                            <p className="mt-4 text-sm text-white/60">Loading committee...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!committee) {
        return null;
    }

    return (
        <>
            <DashboardHeader
                profile={profile}
                token={token}
                onOpenMobileNav={() => {}}
                onViewProfile={() => navigate("/dashboard/profile")}
                onLogout={() => {}}
            />
            <div className="pt-32 px-6 py-8 lg:px-12">
                <CommitteeDetailsPage
                    committee={committee}
                    token={token}
                    profile={profile}
                    onBack={() => navigate("/dashboard")}
                    onRefresh={onRefresh}
                />
            </div>
        </>
    );
}
