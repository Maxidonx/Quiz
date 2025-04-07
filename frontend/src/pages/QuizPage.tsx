// src/pages/QuizPage.tsx

import React, { useEffect, useState, useRef } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`/quiz/category/${category}/questions`);
        setQuestions(res.data);
        const now = new Date();
        setStartTime(now.toISOString().slice(0, 19).replace('T', ' '));
      } catch (err: any) {
        console.error(err);
        setError('Failed to load questions.');
      }
    };
    fetchQuestions();
  }, [category]);

  const handleChange = (questionId: number, selectedOption: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 300); // delay for user experience
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentIndex]);

  const handleSubmit = async () => {
    const quizId = questions[0].quiz_id;
    const payload = {
      start_time: startTime,
      answers: Object.entries(answers).map(([id, selected_option]) => ({
        question_id: parseInt(id),
        selected_option,
      })),
    };

    try {
      const res = await axios.post(`/quiz/${quizId}/submit`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setResult(res.data);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError('Failed to submit quiz.');
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!questions.length) return <div>Loading quiz...</div>;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="quiz-page container">
      <h2 className="mb-3">Quiz: {category}</h2>

      {!submitted ? (
        <>
          <div className="progress mb-3">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            >
              {currentIndex + 1} / {questions.length}
            </div>
          </div>

          <div ref={scrollRef}>
            <p><strong>{currentIndex + 1}.</strong> {currentQuestion.question_text}</p>
            {Object.entries(currentQuestion.options).map(([key, text]) => (
              <div key={key}>
                <label>
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={key}
                    checked={answers[currentQuestion.id] === key}
                    onChange={() => handleChange(currentQuestion.id, key)}
                  />{' '}
                  {key}. {text}
                </label>
              </div>
            ))}
          </div>

          {currentIndex === questions.length - 1 && (
            <button className="btn btn-primary mt-3" onClick={handleSubmit}>
              Submit Quiz
            </button>
          )}
        </>
      ) : (
        result && (
          <div className="result mt-4">
            <h4>{result.message}</h4>
            <p>Score: {result.score} / {result.total_questions}</p>
            <p>Time Taken: {Math.round(result.time_taken)} seconds</p>

            {Object.keys(result.correct_answers).length > 0 && (
              <>
                <h5>Correct Answers:</h5>
                <ul>
                  {Object.entries(result.correct_answers).map(([qid, answer]) => (
                    <li key={qid}>Question {qid}: Correct option is <strong>{answer}</strong></li>
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
