import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, login } from "../lib/apiServices.js";

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMessage("");
		setIsSubmitting(true);
		try {
			await login(username, password);
			const user = await getCurrentUser();

			if (user.role === "instructor") {
				navigate("/dashboard/instructor");
			} else {
				navigate("/dashboard/student");
			}
		} catch (error) {
			console.error("Login failed:", error);
			setErrorMessage("Login failed. Username or password is incorrect.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="auth-page">
			<div className="auth-container">
				<h2>Login</h2>
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
						<label htmlFor="password">Password:</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Logging in..." : "Login"}
					</button>
				</form>
				<Link className="form-link" to="/register">
					Don't have an account? Register here.
				</Link>
			</div>
		</main>
	);
}

export default Login;
