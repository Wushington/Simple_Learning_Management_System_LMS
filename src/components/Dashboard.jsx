import { useNavigate, Route, Routes } from "react-router-dom";
import InstructorView from './InstructorView.jsx';
import StudentView from './StudentView.jsx';

function Dashboard() {
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        navigate("/login");
        return null;
    }

    return (
        <div className="dashboard">
            <h1>Welcome to the Dashboard</h1>
            <p>This is a protected route. You can add your dashboard content here.</p>
            <Routes>
                <Route path="/InstructorView" element={<InstructorView />} />
                <Route path="/StudentView" element={<StudentView />} />
            </Routes>
        </div>
    );
}

export default Dashboard;
