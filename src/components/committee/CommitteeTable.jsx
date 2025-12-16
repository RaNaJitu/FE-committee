import { Button } from "../ui/Button.jsx";
import { StatusBadge } from "./StatusBadge.jsx";

export function CommitteeTable({
    committees: items,
    meta,
    isLoading,
    isError,
    error,
    onRefresh,
    onViewCommittee,
    onCreate,
    canCreate = false,
}) {
    return (
        <section className="rounded-3xl mt-16 border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Committees</h2>
                    <p className="text-sm text-white/60">
                        {meta?.total
                            ? `${meta.total} committee${meta.total === 1 ? "" : "s"} tracked.`
                            : "Latest committee records from the server."}
                    </p>
                </div>
                <div className="flex gap-2">
                    {canCreate && onCreate && (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={onCreate}
                        >
                            New committee
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onRefresh}
                        disabled={isLoading}
                    >
                        {isLoading ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
            </div>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/30">
                {isLoading ? (
                    <div className="p-8 text-center text-sm text-white/60">
                        Loading committees...
                    </div>
                ) : isError ? (
                    <div className="p-8 text-center text-sm text-rose-200">
                        {error?.message ?? "Unable to load committees."}
                        <div className="mt-3 flex justify-center">
                            <Button variant="secondary" size="md" onClick={onRefresh}>
                                Retry
                            </Button>
                        </div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-8 text-center text-sm text-white/60">
                        No committees found. Try refreshing or create a new committee.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/80">
                        <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Name</th>
                                <th className="px-5 py-3 font-semibold">Amount</th>
                                <th className="px-5 py-3 font-semibold">Max Members</th>
                                {/* <th className="px-5 py-3 font-semibold">Creat Date</th> */}
                                <th className="px-5 py-3 font-semibold">Start Date</th>
                                <th className="px-5 py-3 font-semibold">Fine Amount</th>
                                <th className="px-5 py-3 font-semibold">extra day for fine</th>
                                <th className="px-5 py-3 font-semibold">No of Months</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {items.map((committee) => {
                                const amount =
                                    committee.committeeAmount ??
                                    committee.amount ??
                                    committee.budget ??
                                    "—";
                                const members =
                                    committee.commissionMaxMember ??
                                    committee.maxMembers ??
                                    committee.members ??
                                    "—";
                                const createdAt = committee.createdAt
                                    ? new Date(committee.createdAt).toLocaleString()
                                    : "—";
                                const startDate = committee.startCommitteeDate
                                    ? new Date(committee.startCommitteeDate).toLocaleString()
                                    : "—";
                                const fineAmount = committee.fineAmount
                                    ? Number(committee.fineAmount)
                                    : "—";
                                const extraDaysForFine = committee.extraDaysForFine
                                    ? Number(committee.extraDaysForFine ?? 0)
                                    : "—";
                                
                                const noOfMonths = committee.noOfMonths
                                    ? Number(committee.noOfMonths)
                                    : "—";
                                const statusLabel =
                                    committee.committeeStatus ??
                                    committee.status ??
                                    committee.state ??
                                    "INACTIVE";

                                return (
                                    <tr
                                        key={committee.id}
                                        className="transition hover:bg-white/5 cursor-pointer"
                                        onClick={() => onViewCommittee?.(committee)}
                                    >
                                        <td className="px-5 py-4 font-semibold text-white">
                                            {committee.committeeName ??
                                                committee.title ??
                                                committee.name ??
                                                "Untitled committee"}
                                        </td>
                                        <td className="px-5 py-4">{amount}</td>
                                        <td className="px-5 py-4">{members}</td>
                                        {/* <td className="px-5 py-4">{createdAt}</td> */}
                                        <td className="px-5 py-4">{startDate}</td>
                                        <td className="px-5 py-4">{fineAmount}</td>
                                        <td className="px-5 py-4">{extraDaysForFine}</td>
                                        <td className="px-5 py-4">{noOfMonths}</td>
                                        <td className="px-5 py-4">
                                            <StatusBadge
                                                status={statusLabel}
                                                subtle
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}

