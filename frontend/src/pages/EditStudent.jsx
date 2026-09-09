import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    student_id: "",
    name: "",
    email: "",
    phone: "",
    course: "",
    department: "",
    semester: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load student
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/students/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load students");
        }

        const students = await response.json();

        const student = students.find(
          (item) => item.student_id === id
        );

        if (!student) {
          setError("Student not found");
          return;
        }

        setForm({
          student_id: student.student_id || "",
          name: student.name || "",
          email: student.email || "",
          phone: student.phone || "",
          course: student.course || "",
          department: student.department || "",
          semester: student.semester || "",
          status: student.status || "Active",
        });
      } catch (error) {
        console.error(error);
        setError("Unable to load student from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/students/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update student"
        );
      }

      alert("Student updated successfully!");

      navigate(`/students/${id}`);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          Loading student information...
        </p>
      </div>
    );
  }

  // Error
  if (error && !form.student_id) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {error}
        </h1>

        <Link
          to="/students"
          className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Header */}
      <div>
        <Link
          to={`/students/${id}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to Student Details
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Edit Student
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update student information.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
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
              name="student_id"
              value={form.student_id}
              onChange={handleChange}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none"
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
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
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
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
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
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900"
            >
              <option value="">Select department</option>
              <option value="Computer Science">
                Computer Science
              </option>
              <option value="Information Technology">
                Information Technology
              </option>
              <option value="Electronics">
                Electronics
              </option>
              <option value="Mechanical">
                Mechanical
              </option>
              <option value="Civil">
                Civil
              </option>
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
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900"
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
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900"
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

        {/* Buttons */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

          <Link
            to={`/students/${id}`}
            className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default EditStudent;