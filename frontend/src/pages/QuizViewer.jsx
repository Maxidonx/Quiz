// src/pages/QuizViewer.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizViewer() {
  const { quizIdentifier } = useParams();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/quiz/${quizIdentifier}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load quiz");
        setLoading(false);
      });
  }, [quizIdentifier]);

  const next = () => setCurrent((prev) => Math.min(prev + 1, questions.length - 1));
  const prev = () => setCurrent((prev) => Math.max(prev - 1, 0));

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  const q = questions[current];

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <div className="flex justify-between mb-4">
        <button
          onClick={prev}
          disabled={current === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={next}
          disabled={current === questions.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="bg-white shadow p-6 rounded-lg"
        >
          <h2 className="text-lg font-semibold mb-4">
            Question {current + 1} of {questions.length}
          </h2>
          <p className="mb-4">{q.question_text}</p>
          <div className="grid grid-cols-2 gap-4">
            {["A", "B", "C", "D"].map((opt) => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                key={opt}
                className="border p-2 rounded hover:bg-gray-100 transition"
              >
                <strong>{opt}:</strong> {q.options[opt]}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
