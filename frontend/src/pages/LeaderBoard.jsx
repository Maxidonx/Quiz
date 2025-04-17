// src/pages/Leaderboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/leaderboard')
      .then(res => setEntries(res.data.leaders))
      .catch(err => console.error('Leaderboard error:', err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th>Rank</th>
            <th>User</th>
            <th>Quiz</th>
            <th>Score</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i} className="text-center border-b">
              <td>{i + 1}</td>
              <td>{e.username}</td>
              <td>{e.quiz_title}</td>
              <td>{e.score}</td>
              <td>{Math.round(e.time_taken)}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
