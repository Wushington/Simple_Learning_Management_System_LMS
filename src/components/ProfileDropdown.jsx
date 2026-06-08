import { useEffect, useRef, useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../lib/apiServices.js";

export default function ProfileDropdown() {
	const [isOpen, setIsOpen] = useState(false);
	const [user, setUser] = useState(null);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();

	const toggleDropdown = () => setIsOpen((prev) => !prev);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		let isMounted = true;

		async function loadUser() {
			try {
				const currentUser = await getCurrentUser();

				if (isMounted) {
					setUser(currentUser);
				}
			} catch {
				if (isMounted) {
					setUser(null);
				}
			}
		}

		loadUser();

		return () => {
			isMounted = false;
		};
	}, []);

	async function handleLogout() {
		await logout();
		setIsOpen(false);
		navigate("/login", { replace: true });
	}

	return (
		<div className="dropdown-container" ref={dropdownRef}>
			<button
				aria-expanded={isOpen}
				aria-haspopup="true"
				className="profile-trigger"
				onClick={toggleDropdown}
				type="button"
			>
				<span>{user?.username ?? "Profile"}</span>
				<BiChevronDown aria-hidden="true" className="profile-trigger-icon" />
			</button>

			{isOpen && (
				<div className="dropdown-menu">
					<div className="user-info-header">
						<p className="user-name">{user?.username ?? "Unknown user"}</p>
						<p className="user-email">{user?.email ?? "No email available"}</p>
						<p className="user-role">{user?.role ?? "No role assigned"}</p>
					</div>

					<hr className="divider" />

					<ul className="menu-list">
						<li>
							<button onClick={handleLogout} className="menu-item logout-btn">
								Logout
							</button>
						</li>
					</ul>
				</div>
			)}
		</div>
	);
}
