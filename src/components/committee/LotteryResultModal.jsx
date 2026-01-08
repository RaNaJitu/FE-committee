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
}) {
    if (!lotteryResult && !isLoading) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title="Lottery Draw Result"
            description="The randomly selected winner for this lottery draw."
            footer={
                <div className="flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onSubmit}
                        isLoading={isSubmitting}
                        disabled={isSubmitting || !lotteryResult}
                    >
                        Submit
                    </Button>
                </div>
            }
        >
            {isLoading ? (
                <div className="p-8 text-center text-sm text-white/60">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-yellow-400 border-r-transparent"></div>
                    <p className="mt-3">Drawing lottery...</p>
                </div>
            ) : lotteryResult ? (
                <div className="space-y-6">
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
            ) : null}
        </Modal>
    );
}
