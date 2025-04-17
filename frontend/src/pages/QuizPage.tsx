import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

type Question = {
  id: number;
  quiz_id: number;
  question_text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
};

type QuizResult = {
  message: string;
  score: number;
  total_questions: number;
  correct_answers: Record<number, string>;
  time_taken: number;
};

const QuizPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [startTime, setStartTime] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/quiz/category/${category}/questions`);
        setQuestions(res.data);
        const now = new Date();
        setStartTime(now.toISOString().slice(0, 19).replace('T', ' '));
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError('Failed to load questions.');
      }
    };
    fetchQuestions();
  }, [category]);

  const handleChange = (questionId: number, selectedOption: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleSubmit = async () => {
    if (!questions.length || !questions[0]?.quiz_id) {
      setError("Quiz ID is missing. Cannot submit.");
      return;
    }

    const quizId = questions[0].quiz_id;
    const payload = {
      start_time: startTime,
      answers: Object.entries(answers).map(([id, selected_option]) => ({
        question_id: parseInt(id),
        selected_option,
      })),
    };

    try {
      console.log("Submitting payload:", payload);

      const res = await axios.post(`http://localhost:5000/api/quiz/${quizId}/submit`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setResult(res.data);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err.response?.data || err.message);
      setError('Failed to submit quiz.');
    }
  };

  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;
  if (!questions.length) return <div className="text-center mt-4">Loading quiz...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Quiz: {category}</h2>

      {!submitted ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {questions.map((q, index) => (
            <div key={q.id} className="mb-6 border-b pb-4">
              <p className="font-medium mb-2">{index + 1}. {q.question_text}</p>
              {Object.entries(q.options).map(([key, text]) => (
                <label key={key} className="block">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={key}
                    checked={answers[q.id] === key}
                    onChange={() => handleChange(q.id, key)}
                    className="mr-2"
                    required
                  />
                  {key}. {text}
                </label>
              ))}
            </div>
          ))}

          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Submit Quiz
          </button>
        </form>
      ) : (
        result && (
          <div className="mt-6">
            <h4 className="text-xl font-semibold mb-2">{result.message}</h4>
            <p>Score: {result.score} / {result.total_questions}</p>
            <p>Time Taken: {Math.round(result.time_taken)} seconds</p>

            {Object.keys(result.correct_answers).length > 0 && (
              <>
                <h5 className="mt-4 font-semibold">Correct Answers:</h5>
                <ul className="list-disc ml-6">
                  {Object.entries(result.correct_answers).map(([qid, answer]) => (
                    <li key={qid}>Q{qid}: Correct answer is <strong>{answer}</strong></li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default QuizPage;
