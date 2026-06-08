import { useNavigate, Navigate, Route, Routes } from "react-router-dom";
import InstructorView from "./InstructorView.jsx";
import StudentView from "./StudentView.jsx";

function Dashboard() {
	const navigate = useNavigate();
	const accessToken = localStorage.getItem("accessToken");

	if (!accessToken) {
		navigate("/login");
		return null;
	}

	return (
		<div className="dashboard">
			<div className="dashboard-header">
				<h1>Dashboard</h1>
			</div>
			<div className="dashboard-content">
                <Routes>
                    <Route path="/" element={<Navigate to="/student" replace />} />
                    <Route path="/instructor" element={<InstructorView />} />
                    <Route path="/student" element={<StudentView />} />
                </Routes>
            </div>
            <div className="dashboard-footer">
                <p>&copy; 2024 Simple LMS. All rights reserved.</p>
            </div>
		</div>
	);
}

export default Dashboard;
