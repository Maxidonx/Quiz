import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-tr from-blue-200 to-indigo-300 text-center px-4">
      <h1 className="text-4xl sm:text-6xl font-extrabold text-indigo-900 animate-bounce mb-8">
        Welcome to My Quiz Game
      </h1>
      <div className="flex space-x-4">
        <Link
          to="/register"
          className="bg-green-600 text-white px-6 py-2 rounded shadow-md hover:bg-green-700 transition"
        >
          Sign Up
        </Link>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded shadow-md hover:bg-blue-700 transition"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
