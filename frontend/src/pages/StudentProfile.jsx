import { useState } from "react";

function StudentProfile() {
  const [student] = useState(() => {
    const savedStudent = localStorage.getItem("studentUser");

    if (!savedStudent) {
      return null;
    }

    try {
      return JSON.parse(savedStudent);
    } catch (error) {
      console.error("Student profile error:", error);
      return null;
    }
  });

  if (!student) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Student profile not available.
          </p>
        </div>
      </div>
    );
  }

  const username = student.username || "Student";
  const studentId = student.student_id || "N/A";
  const role = student.role || "student";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Account
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your student account information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Profile Header */}
        <div className="flex flex-col gap-5 border-b border-slate-200 px-6 py-7 sm:flex-row sm:items-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white shadow-sm">
            {username.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {username}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Student Account
            </p>
          </div>

          <div className="sm:ml-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Active
            </span>
          </div>

        </div>

        {/* Student Information */}
        <div className="grid gap-4 p-6 md:grid-cols-2">

          {/* Username */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Username
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              {username}
            </p>
          </div>

          {/* Student ID */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Student ID
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              {studentId}
            </p>
          </div>

          {/* Role */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Role
            </p>

            <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
              {role}
            </p>
          </div>

          {/* Account Status */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Account Status
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

              <p className="text-lg font-semibold text-green-600">
                Active
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-bold text-slate-900">
          Account Security
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Your student account is protected by secure authentication.
        </p>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4">

          <div>
            <p className="text-sm font-semibold text-green-800">
              Account Protected
            </p>

            <p className="mt-1 text-xs text-green-700">
              Your student session is currently active.
            </p>
          </div>

          <span className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-green-700 shadow-sm">
            Secure
          </span>

        </div>

      </div>

    </div>
  );
}

export default StudentProfile;