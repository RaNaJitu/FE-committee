import { useEffect, useState } from "react";
import { useCommittees } from "../hooks/useCommittees.js";
import { useToast } from "../context/ToastContext.jsx";
import { createCommittee } from "../services/apiClient.js";
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
    const [activeNav, setActiveNav] = useState("committees");
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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
    });
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState("");
    const [selectedCommittee, setSelectedCommittee] = useState(null);

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

        setIsCreating(true);
        setCreateError("");
        setIsCreateOpen(false);

        const payload = {
            committeeName: name,
            commissionMaxMember: maxMembers,
            committeeAmount: amount,
            noOfMonths: noOfMonths,
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
            <Sidebar
                activeNav={activeNav}
                onSelectNav={setActiveNav}
            />
            <MobileSidebar
                isOpen={isMobileNavOpen}
                onClose={() => setIsMobileNavOpen(false)}
                activeNav={activeNav}
                onSelectNav={(nav) => {
                    setActiveNav(nav);
                    setIsMobileNavOpen(false);
                }}
            />
            <main className="flex-1 overflow-hidden">
                {activeNav === "profile" ? (
                    <ProfilePage
                        token={token}
                        profile={profile}
                        onBack={() => setActiveNav("committees")}
                    />
                ) : (
                    <>
                        <DashboardHeader
                            profile={profile}
                            onOpenMobileNav={() => setIsMobileNavOpen(true)}
                            onViewProfile={() => setActiveNav("profile")}
                            onLogout={onLogout}
                        />
                        <div className="px-6 py-8 lg:px-12">
                            {selectedCommittee ? (
                                <CommitteeDetailsPage
                                    committee={selectedCommittee}
                                    token={token}
                                    onBack={() => setSelectedCommittee(null)}
                                    onRefresh={refresh}
                                />
                            ) : (
                                <>
                                    {activeNav === "committees" && (
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
                                                setSelectedCommittee(committee);
                                            }}
                                        />
                                    )}
                                    {activeNav === "calendar" && <CalendarPage />}
                                    {activeNav !== "committees" && activeNav !== "profile" && activeNav !== "calendar" && (
                                        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                                            <p className="text-white/60">
                                                {navigation.find((nav) => nav.id === activeNav)?.label ?? "This section"} is coming soon.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
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
