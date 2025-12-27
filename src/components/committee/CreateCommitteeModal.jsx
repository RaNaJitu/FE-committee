import { Button } from "../ui/Button.jsx";
import { Modal } from "../ui/Modal.jsx";
import { DatePicker } from "../ui/DatePicker.jsx";

export function CreateCommitteeModal({
    isOpen,
    onClose,
    form,
    onChange,
    onSubmit,
    isSubmitting,
    error,
}) {
    const formId = "create-committee-form";
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create a new committee"
            description="Provide the core financial details and member capacity."
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        form={formId}
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        Create committee
                    </Button>
                </div>
            }
        >
            <form id={formId} className="space-y-4" onSubmit={onSubmit}>
                <label className="block text-sm font-medium text-white/80">
                    Committee name
                    <input
                        className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        name="committeeName"
                        value={form.committeeName}
                        onChange={onChange}
                        required
                        placeholder="e.g. Third Committee"
                    />
                </label>
                <DatePicker
                    label="Start Committee Date"
                    description="Select a date from today onwards"
                    name="startCommitteeDate"
                    value={form.startCommitteeDate}
                    onChange={onChange}
                    minDate={new Date().toISOString().split('T')[0]}
                    placeholder="Select start date"
                    showTime={true}
                    required
                    error={error && error.includes("date") ? error : undefined}
                />
                <label className="block text-sm font-medium text-white/80">
                    Committee Type
                    <span className="ml-1 text-rose-300">*</span>
                    <select
                        className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        name="committeeType"
                        value={form.committeeType || ""}
                        onChange={onChange}
                        required
                    >
                        <option value="" className="bg-slate-900 text-white">Select committee type</option>
                        <option value="COUNTER" className="bg-slate-900 text-white">COUNTER</option>
                        <option value="NORMAL" className="bg-slate-900 text-white">NORMAL</option>
                        <option value="LOTTERY" className="bg-slate-900 text-white">LOTTERY</option>
                    </select>
                </label>
                {form.committeeType === "LOTTERY" && (
                    <label className="block text-sm font-medium text-white/80">
                        Lottery Amount
                        <span className="ml-1 text-rose-300">*</span>
                        <input
                            className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                            name="lotteryAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.lotteryAmount || ""}
                            onChange={onChange}
                            placeholder="e.g. 5000"
                            required
                        />
                    </label>
                )}
                <label className="block text-sm font-medium text-white/80">
                    Max members
                    <input
                        className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        name="commissionMaxMember"
                        type="number"
                        min="1"
                        value={form.commissionMaxMember}
                        onChange={onChange}
                        placeholder="20"
                        required
                    />
                </label>
                <label className="block text-sm font-medium text-white/80">
                    Committee amount
                    <input
                        className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        name="committeeAmount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={form.committeeAmount}
                        onChange={onChange}
                        placeholder="100000"
                        required
                    />
                </label>
                <label className="block text-sm font-medium text-white/80">
                    Number of months
                    <input
                        className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        name="noOfMonths"
                        type="number"
                        min="1"
                        value={form.noOfMonths}
                        onChange={onChange}
                        placeholder="e.g. 12"
                        required
                    />
                </label>
                
                <label className="block text-sm font-medium text-white/80">
                    Fine Amount
                    <input
                        className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        name="fineAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.fineAmount}
                        onChange={onChange}
                        placeholder="e.g. 100"
                        required
                    />
                </label>
                
                <DatePicker
                    label="Fine Date Start"
                    description="Select a date and time from today onwards"
                    name="fineDateStart"
                    value={form.fineDateStart}
                    onChange={onChange}
                    minDate={new Date().toISOString().split('T')[0]}
                    placeholder="Select date and time"
                    required
                    showTime={true}
                    error={error && error.includes("date") ? error : undefined}
                />
                {/* <label className="block text-sm font-medium text-white/80">
                    Extra Days For Fine
                    <input
                        className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        name="extraDaysForFine"
                        type="number"
                        min="0"
                        value={form.extraDaysForFine}
                        onChange={onChange}
                        placeholder="e.g. 5"
                        required
                    />
                </label> */}
                {error && (
                    <p className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                        {error}
                    </p>
                )}
            </form>
        </Modal>
    );
}

