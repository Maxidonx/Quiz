// src/pages/AdminDashboard.jsx
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    navigate("/login");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-800">Admin Dashboard</h1>
      <p className="mt-2">You have access to admin-only routes.</p>
      <button onClick={logout} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Logout</button>
    </div>
  );
}
