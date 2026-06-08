import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post(
				"http://localhost:8000/api/accounts/login/",
				{
					email,
					password,
				},
			);
			localStorage.setItem("accessToken", response.data.access);
			localStorage.setItem("refreshToken", response.data.refresh);
			navigate("/");
		} catch (error) {
			console.error("Login failed:", error);
			alert("Login failed. Email or password is incorrect.");
		}
	};

	return (
		<div className="auth-container">
			<h2>Login</h2>
			<form onSubmit={handleSubmit}>
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
				<button type="submit">Login</button>
			</form>
			<Link className="form-link" to="/register">
				Don't have an account? Register here.
			</Link>
		</div>
	);
}

export default Login;
