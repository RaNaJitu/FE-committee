import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import { InputField } from "../ui/InputField.jsx";

export function AuthCard({
    authMode,
    onModeChange,
    loginValues,
    signupValues,
    onLoginChange,
    onSignupChange,
    onLoginSubmit,
    onSignupSubmit,
    isSubmitting,
    isSigningUp,
    formError,
    signupError,
    isLoginValid,
    isSignupValid,
    onForgotPassword,
}) {
    const isLogin = authMode === "login";

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <div className="flex items-center justify-between gap-3">
                    <CardTitle>{isLogin ? "login your account" : "Create an account"}</CardTitle>
                    <div className="rounded-full border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                        <button
                            type="button"
                            onClick={() => onModeChange("login")}
                            className={`rounded-full px-3 py-1 transition ${isLogin ? "bg-white text-slate-900" : "text-white/70"}`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => onModeChange("signup")}
                            className={`rounded-full px-3 py-1 transition ${!isLogin ? "bg-white text-slate-900" : "text-white/70"}`}
                        >
                            Signup
                        </button>
                    </div>
                </div>
                <p className="text-sm text-white/70">
                    {isLogin
                        ? "Enter your credentials to access the dashboard."
                        : "Fill out the details below to register a new account."}
                </p>
            </CardHeader>
            <CardContent>
                {isLogin ? (
                    <form className="flex flex-col gap-6" onSubmit={onLoginSubmit} noValidate>
                        <InputField
                            label="Phone number"
                            name="phoneNo"
                            type="text"
                            placeholder="081234567890"
                            autoComplete="tel"
                            value={loginValues.phoneNo}
                            onChange={onLoginChange}
                            required
                        />
                        <InputField
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            value={loginValues.password}
                            onChange={onLoginChange}
                            required
                        />
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-white/80">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={loginValues.remember}
                                    onChange={onLoginChange}
                                    className="h-4 w-4 rounded border-white/30 bg-transparent text-yellow-400 focus:ring-yellow-300"
                                />
                                Remember me
                            </label>
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-sm font-medium text-yellow-300 transition hover:text-yellow-200"
                            >
                                Forgot password?
                            </button>
                        </div>
                        {formError && (
                            <p className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                                {formError}
                            </p>
                        )}
                        <Button
                            type="submit"
                            size="lg"
                            isLoading={isSubmitting}
                            disabled={!isLoginValid || isSubmitting}
                            className="w-full"
                        >
                            Sign in
                        </Button>
                    </form>
                ) : (
                    <form className="flex flex-col gap-5" onSubmit={onSignupSubmit} noValidate>
                        <InputField
                            label="Full name"
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            value={signupValues.name}
                            onChange={onSignupChange}
                            required
                        />
                        <InputField
                            label="Phone number"
                            name="phoneNo"
                            type="text"
                            placeholder="081234567890"
                            autoComplete="tel"
                            value={signupValues.phoneNo}
                            onChange={onSignupChange}
                            required
                        />
                        <InputField
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="demo@gmail.com"
                            autoComplete="email"
                            value={signupValues.email}
                            onChange={onSignupChange}
                            required
                        />
                        <InputField
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            autoComplete="new-password"
                            value={signupValues.password}
                            onChange={onSignupChange}
                            required
                        />
                        <label className="block text-left text-sm font-medium text-white/90">
                            Role
                            <select
                                name="role"
                                value={signupValues.role}
                                onChange={onSignupChange}
                                className="mt-2 w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white outline-none transition focus:border-white focus:ring-2 focus:ring-white/50"
                            >
                                <option value="USER" className="text-black">User</option>
                                <option value="ADMIN" className="text-black">Admin</option>
                            </select>
                        </label>
                        {signupError && (
                            <p className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                                {signupError}
                            </p>
                        )}
                        <Button
                            type="submit"
                            size="lg"
                            isLoading={isSigningUp}
                            disabled={!isSignupValid || isSigningUp}
                            className="w-full"
                        >
                            Sign up
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}

