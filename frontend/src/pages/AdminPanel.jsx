// src/pages/AdminPanel.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import CreateQuizForm from "../components/CreateQuizForm";
import AddQuestionForm from "../components/AddQuestionForm";

export default function AdminPanel() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/quiz/categories");
      setQuizzes(res.data);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Quiz Panel</h2>

      <CreateQuizForm onCreated={fetchQuizzes} />

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Add Questions</h3>
        <select
          className="w-full p-2 mb-3 border"
          onChange={(e) => setSelectedQuiz(e.target.value)}
        >
          <option value="">-- Select Quiz Category --</option>
          {quizzes.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {selectedQuiz && <AddQuestionForm quizIdentifier={selectedQuiz} />}
      </div>
    </div>
  );
}
