import { useState } from "react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { InputField } from "../ui/InputField.jsx";

export function ChangePasswordModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    error,
}) {
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [formError, setFormError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
        // Clear form error when user starts typing
        if (formError) {
            setFormError("");
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setFormError("");

        // Validation
        if (!formData.oldPassword.trim()) {
            setFormError("Please enter your current password.");
            return;
        }

        if (!formData.newPassword.trim()) {
            setFormError("Please enter a new password.");
            return;
        }

        if (formData.newPassword.length < 6) {
            setFormError("New password must be at least 6 characters long.");
            return;
        }

        if (formData.newPassword === formData.oldPassword) {
            setFormError("New password must be different from your current password.");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setFormError("New password and confirm password do not match.");
            return;
        }

        // Call parent onSubmit handler
        onSubmit({
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
        });
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setFormError("");
            onClose();
        }
    };

    const displayError = error || formError;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Change Password"
            description="Update your account password. Make sure to use a strong password."
            footer={
                <div className="flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        form="change-password-form"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        Change Password
                    </Button>
                </div>
            }
        >
            <form id="change-password-form" className="space-y-4" onSubmit={handleSubmit}>
                <InputField
                    label="Current Password"
                    name="oldPassword"
                    type="password"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    required
                    autoComplete="current-password"
                />

                <InputField
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    required
                    autoComplete="new-password"
                    description="Password must be at least 6 characters long"
                />

                <InputField
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    required
                    autoComplete="new-password"
                />

                {displayError && (
                    <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                        {displayError}
                    </div>
                )}
            </form>
        </Modal>
    );
}

