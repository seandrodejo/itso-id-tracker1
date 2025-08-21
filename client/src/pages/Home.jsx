import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold">Welcome to ITSO ID Tracker</h1>
      <p className="mt-4">Please login or register to continue.</p>
      <div className="mt-6 space-x-4">
        <Link to="/login" className="text-blue-500">Login</Link>
        <Link to="/register" className="text-green-500">Register</Link>
      </div>
    </div>
  );
}

export default Home;
