// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirm_password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/register", formData);
      navigate("/login");
    } catch (err) {
      alert(err.response.data.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white">
      <h2 className="text-2xl mb-4 font-semibold">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-3 w-80">
        {["username", "email", "password", "confirm_password"].map((field) => (
          <input
            key={field}
            type={field.includes("password") ? "password" : "text"}
            placeholder={field.replace("_", " ")}
            value={formData[field]}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            className="border w-full p-2 rounded"
          />
        ))}
        <button className="bg-green-600 text-white py-2 px-4 rounded w-full hover:bg-green-800">Sign Up</button>
      </form>
    </div>
  );
}
