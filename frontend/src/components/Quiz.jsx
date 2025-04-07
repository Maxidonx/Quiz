import { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:5000/api/quiz'; // Replace with your actual

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error('Error loading quiz:', err);
      }
    };
    fetchQuiz();
  }, []);

  if (questions.length === 0) return <p className="text-white">Loading quiz...</p>;

  const question = questions[current];

  const handleNext = () => {
    setSelected(null);
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      alert('Quiz complete!');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-white">
      <h2 className="text-2xl mb-4">{question.question}</h2>
      <div className="space-y-2">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            className={`block w-full text-left p-3 rounded border 
              ${selected === option ? 'bg-blue-600' : 'bg-gray-800'}
            `}
            onClick={() => setSelected(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={selected === null}
        className="mt-6 px-6 py-2 bg-green-600 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

export default Quiz;
