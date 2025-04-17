// src/components/CreateQuizForm.jsx
import { useState } from "react";
import axios from "axios";

export default function CreateQuizForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:5000/api/quiz",
        { title, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setCategory("");
      onCreated();
    } catch (err) {
      console.error("Quiz creation failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Create New Quiz</h3>
      <input
        type="text"
        placeholder="Quiz Title"
        className="w-full p-2 mb-2 border"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Category"
        className="w-full p-2 mb-2 border"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Create Quiz
      </button>
    </form>
  );
}
