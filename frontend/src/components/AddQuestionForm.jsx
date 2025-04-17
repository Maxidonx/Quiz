// src/components/AddQuestionForm.jsx
import { useState } from "react";
import axios from "axios";

export default function AddQuestionForm({ quizIdentifier }) {
  const [form, setForm] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `http://localhost:5000/api/quiz/${quizIdentifier}/question`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "A",
      });
    } catch (err) {
      console.error("Question add failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        className="w-full p-2 border mb-2"
        name="question_text"
        placeholder="Enter question"
        value={form.question_text}
        onChange={handleChange}
        required
      />
      {["a", "b", "c", "d"].map((opt) => (
        <input
          key={opt}
          className="w-full p-2 border mb-2"
          placeholder={`Option ${opt.toUpperCase()}`}
          name={`option_${opt}`}
          value={form[`option_${opt}`]}
          onChange={handleChange}
          required
        />
      ))}
      <select
        className="w-full p-2 border mb-4"
        name="correct_option"
        value={form.correct_option}
        onChange={handleChange}
      >
        {["A", "B", "C", "D"].map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Add Question
      </button>
    </form>
  );
}
