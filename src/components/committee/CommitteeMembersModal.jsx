import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { getCommitteeMembers } from "../../services/apiClient.js";

export function CommitteeMembersModal({
    isOpen,
    onClose,
    committee,
    token,
}) {
    
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen && committee?.id && token) {
            setIsLoading(true);
            setError("");
            getCommitteeMembers(token, committee.id)
                .then((response) => {
                    const membersList = Array.isArray(response?.data)
                        ? response.data
                        : Array.isArray(response)
                            ? response
                            : [];
                    setMembers(membersList);
                })
                .catch((err) => {
                    setError(err.message || "Failed to load committee members.");
                    setMembers([]);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setMembers([]);
            setError("");
        }
    }, [isOpen, committee?.id, token]);

    const committeeName = committee?.committeeName ?? committee?.title ?? committee?.name ?? "Committee";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Members of ${committeeName}`}
            description={`View all members associated with this committee.`}
            footer={
                <div className="flex justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            }
        >
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
                            onClick={() => {
                                if (committee?.id && token) {
                                    setIsLoading(true);
                                    setError("");
                                    getCommitteeMembers(token, committee.id)
                                        .then((response) => {
                                            const membersList = Array.isArray(response?.data)
                                                ? response.data
                                                : Array.isArray(response)
                                                    ? response
                                                    : [];
                                            setMembers(membersList);
                                        })
                                        .catch((err) => {
                                            setError(err.message || "Failed to load committee members.");
                                        })
                                        .finally(() => {
                                            setIsLoading(false);
                                        });
                                }
                            }}
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
                                        <th className="px-5 py-3 font-semibold">Email</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {members.map((member, index) => (
                                        <tr key={member.id ?? index} className="transition hover:bg-white/5">
                                            <td className="px-5 py-4 font-semibold text-white">
                                                {member?.user?.name ?? member.memberName ?? "—"}
                                            </td>
                                            <td className="px-5 py-4">
                                                {member?.user?.phoneNo ?? member.phone ?? "—"}
                                            </td>
                                            <td className="px-5 py-4">
                                                {member?.user?.email ?? member.email ?? "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-white/50 text-center">
                            Total: {members.length} member{members.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
}

