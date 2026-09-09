import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function AddStudent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    studentId: "",
    name: "",
    email: "",
    phone: "",
    course: "",
    semester: "",
    department: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://face-recognition-2-4pc8.onrender.com/students/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          student_id: form.studentId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          course: form.course,
          department: form.department,
          semester: form.semester,
          status: form.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to create student");
      }

      const data = await response.json();

      console.log("Student created:", data);

      navigate("/students");
    } catch (error) {
      console.error("Error:", error);
      setError(
        "Unable to create student. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Header */}
      <div>
        <Link
          to="/students"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to Students
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Add Student
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Enter student information to create a new student profile.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Student ID */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Student ID
            </label>

            <input
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              placeholder="e.g. STU006"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
              required
            />
          </div>

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Phone
            </label>

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          {/* Department */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Department
            </label>

            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900"
              required
            >
              <option value="">Select department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">
                Information Technology
              </option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Course
            </label>

            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900"
              required
            >
              <option value="">Select course</option>
              <option value="B.Tech CSE">B.Tech CSE</option>
              <option value="B.Tech IT">B.Tech IT</option>
              <option value="BCA">BCA</option>
              <option value="MCA">MCA</option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Semester
            </label>

            <select
              name="semester"
              value={form.semester}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900"
              required
            >
              <option value="">Select semester</option>
              <option value="1st">1st Semester</option>
              <option value="2nd">2nd Semester</option>
              <option value="3rd">3rd Semester</option>
              <option value="4th">4th Semester</option>
              <option value="5th">5th Semester</option>
              <option value="6th">6th Semester</option>
              <option value="7th">7th Semester</option>
              <option value="8th">8th Semester</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

          <Link
            to="/students"
            className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Student"}
          </button>

        </div>
      </form>

      {/* Face Registration Info */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <h3 className="font-semibold text-slate-900">
          Face Registration
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          After creating the student, you will be able to register
          their face for automatic attendance recognition.
        </p>
      </div>

    </div>
  );
}

export default AddStudent;