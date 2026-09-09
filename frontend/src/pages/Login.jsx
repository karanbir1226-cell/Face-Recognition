import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint =
        role === "student"
          ? "http://127.0.0.1:8000/auth/student-login"
          : "http://127.0.0.1:8000/auth/admin-login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Save login information
      if (role === "student") {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        localStorage.setItem("studentToken", data.access_token);
        localStorage.setItem("studentUser", JSON.stringify(data.user));

        navigate("/student-dashboard");
      } else {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentUser");

        localStorage.setItem("adminToken", data.access_token);
        localStorage.setItem("adminUser", JSON.stringify(data.user));

        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">FR</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Face Attendance
          </h1>

          <p className="text-slate-500 mt-2">
            Attendance & Information System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Login As
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-xl py-3 font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;