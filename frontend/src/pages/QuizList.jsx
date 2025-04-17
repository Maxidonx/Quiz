// src/pages/QuizList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function QuizList() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/quiz/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
      <ul className="space-y-3">
        {categories.map((cat) => (
          <li key={cat}>
            <Link to={`/quiz/${encodeURIComponent(cat)}`} className="block bg-blue-100 hover:bg-blue-200 rounded p-3">
              {cat}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
