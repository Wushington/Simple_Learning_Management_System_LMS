import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("student");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const formatErrorMessages = (data) => {
        if (!data) {
            return "Registration failed. Please try again.";
        }

        if (typeof data === "string") {
            return data;
        }

        if (Array.isArray(data)) {
            return data.join(" ");
        }

        return Object.entries(data)
            .map(([field, value]) => {
                const label = field === "non_field_errors"
                    ? "Error"
                    : field.charAt(0).toUpperCase() + field.slice(1);
                const message = Array.isArray(value)
                    ? value.join(" ")
                    : String(value);

                return `${label}: ${message}`;
            })
            .join(" ");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(
                "http://localhost:8000/api/accounts/register/",
                {
                    username,
                    email,
                    password,
                    role,
                },
            );
            alert("Registration successful! Please log in.");
            navigate("/login");
        } catch (error) {
            console.error("Registration failed:", error);
            setErrorMessage(formatErrorMessages(error.response?.data));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-container">
                <h2>Create an Account</h2>
                {errorMessage && (
                    <p className="form-error" role="alert">
                        {errorMessage}
                    </p>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Role:</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </div>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Registering..." : "Register"}
                    </button>
                </form>
                <Link className="form-link" to="/login">
                    Already have an account? Login here.
                </Link>
            </div>
        </main>
    );
}

export default Register;
