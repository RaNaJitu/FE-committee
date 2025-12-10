import { useState, useEffect } from "react";
import { Button } from "../ui/Button.jsx";
import { Modal } from "../ui/Modal.jsx";
import { SelectField } from "../ui/SelectField.jsx";
import { getUserList } from "../../services/apiClient.js";

export function AddCommitteeMemberModal({
    isOpen,
    onClose,
    form,
    onChange,
    onSubmit,
    isSubmitting,
    error,
    token,
}) {
    const formId = "add-committee-member-form";
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [usersError, setUsersError] = useState("");

    useEffect(() => {
        if (isOpen && token) {
            setIsLoadingUsers(true);
            setUsersError("");
            getUserList(token)
                .then((response) => {
                    const usersList = Array.isArray(response?.data)
                        ? response.data
                        : Array.isArray(response)
                            ? response
                            : [];
                    setUsers(usersList);
                })
                .catch((err) => {
                    setUsersError(err.message || "Failed to load users.");
                    setUsers([]);
                })
                .finally(() => {
                    setIsLoadingUsers(false);
                });
        } else {
            setUsers([]);
        }
    }, [isOpen, token]);

    const userOptions = users.map((user) => {
        const userData = user?.data ?? user;
        const phoneNo = userData?.phoneNo ?? userData?.phone ?? "";
        const name = userData?.name ?? userData?.userName ?? "";
        const email = userData?.email ?? "";
        
        return {
            value: phoneNo,
            label: `${phoneNo}${name ? ` - ${name}` : ""}`,
            name,
            email,
            phoneNo,
        };
    }).filter((option) => option.value); // Filter out users without phone numbers

    const handleUserSelect = (selectedOption) => {
        if (selectedOption && onChange) {
            // Auto-fill name and email
            onChange({
                target: {
                    name: "name",
                    value: selectedOption.name || "",
                },
            });
            onChange({
                target: {
                    name: "email",
                    value: selectedOption.email || "",
                },
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add committee member"
            description="Invite a member by providing their details."
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
                        Add member
                    </Button>
                </div>
            }
        >
            <form id={formId} className="space-y-4" onSubmit={onSubmit}>
                <SelectField
                    label="Phone number"
                    description="Select a user from the list or type phone number manually"
                    value={form.phoneNo}
                    onChange={onChange}
                    onSelect={handleUserSelect}
                    options={userOptions}
                    placeholder={isLoadingUsers ? "Loading users..." : "Select or type phone number"}
                    searchable={true}
                    allowManualEntry={true}
                    required={true}
                    disabled={isLoadingUsers || isSubmitting}
                    error={usersError}
                />
                <label className="block text-sm font-medium text-white/80">
                    Member name <span className="text-rose-300">*</span>
                    <input
                        className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        placeholder="demo member"
                        required
                        disabled={isSubmitting}
                    />
                </label>
                <label className="block text-sm font-medium text-white/80">
                    Email (optional)
                    <input
                        className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="demo@gmail.com"
                    />
                </label>
                <label className="block text-sm font-medium text-white/80">
                    Password (optional)
                    <input
                        className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={onChange}
                        placeholder="admin123"
                    />
                </label>
                {error && (
                    <p className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                        {error}
                    </p>
                )}
            </form>
        </Modal>
    );
}

