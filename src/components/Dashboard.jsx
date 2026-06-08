import { Navigate, Route, Routes } from "react-router-dom";
import InstructorView from "./InstructorView.jsx";
import StudentView from "./StudentView.jsx";

function Dashboard() {
	return (
		<div className="dashboard">
			<div className="dashboard-header">
				<h1>Dashboard</h1>
			</div>
			<div className="dashboard-content">
                <Routes>
                    <Route index element={<Navigate to="student" replace />} />
                    <Route path="instructor" element={<InstructorView />} />
                    <Route path="student" element={<StudentView />} />
                </Routes>
            </div>
            <div className="dashboard-footer">
                <p>&copy; 2026 Simple LMS. All rights reserved.</p>
            </div>
		</div>
	);
}

export default Dashboard;
