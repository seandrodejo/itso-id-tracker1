import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL from "../api";

function Register() {
  const [name, setName] = useState("");
  const [student_id, setStudentId] = useState("");
  const [personal_email, setPersonalEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = { name, student_id, personal_email, password };

    try {
      console.log("📤 Sending:", formData);

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Registered successfully!");
        navigate("/dashboard");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Something went wrong. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join ITSO ID Tracker today
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <input
                placeholder="Student ID"
                value={student_id}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <input
                placeholder="Email Address"
                type="email"
                value={personal_email}
                onChange={(e) => setPersonalEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;




