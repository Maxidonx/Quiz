// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    nationality: "",
    profile_image: "",
  });
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setForm({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        nationality: res.data.nationality || "",
        profile_image: res.data.profile_image || "",
      });
    } catch (err) {
      console.error("Profile error:", err);
      navigate("/login"); // redirect if unauthenticated
    }
  };

  useEffect(() => {
    if (!token) navigate("/login");
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("first_name", form.first_name);
    data.append("last_name", form.last_name);
    data.append("nationality", form.nationality);
    if (file) {
      data.append("profile_image", file);
    } else {
      data.append("profile_image", form.profile_image); // Fallback URL string
    }

    try {
      await axios.put("http://localhost:5000/api/user/profile/update", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchProfile();
      setShowProfileForm(false);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-blue-50 text-center p-6">
      <div className="flex justify-between items-center px-4 py-4">
        <h1 className="text-xl font-bold">Quiz Game</h1>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="text-red-500 font-semibold">Logout</button>
          {user.profile_image && (
            <img src={user.profile_image} className="w-10 h-10 rounded-full" alt="Profile" />
          )}
          <button
            className="text-blue-600 font-semibold"
            onClick={() => setShowProfileForm(!showProfileForm)}
          >
            Profile
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center h-[60vh]">
        <h2 className="text-4xl font-bold animate-bounce">Welcome {user.username}</h2>
      </div>

      {showProfileForm && (
        <form
          onSubmit={handleUpdate}
          className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md"
        >
          <h3 className="text-lg font-semibold mb-4">Update Profile</h3>
          <input
            className="w-full p-2 mb-3 border rounded"
            placeholder="First Name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
          <input
            className="w-full p-2 mb-3 border rounded"
            placeholder="Last Name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
          <input
            className="w-full p-2 mb-3 border rounded"
            placeholder="Nationality"
            value={form.nationality}
            onChange={(e) => setForm({ ...form, nationality: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <input
            className="w-full p-2 mb-3 border rounded"
            placeholder="Or Image URL"
            value={form.profile_image}
            onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
}
