import { useState } from "react";

function Profile() {
  const [admin] = useState(() => {
    const savedAdmin = localStorage.getItem("adminUser");

    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  if (!admin) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">
          Admin profile not available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Admin Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your administrator account information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        {/* Admin Header */}
        <div className="flex items-center gap-5">

          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white">
            {admin.username?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {admin.username}
            </h2>

            <p className="mt-1 text-slate-500">
              Administrator
            </p>
          </div>

        </div>

        {/* Account Information */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">

          {/* Username */}
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Username
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              {admin.username}
            </p>
          </div>

          {/* Role */}
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Role
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              Admin
            </p>
          </div>

          {/* Account ID */}
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Account ID
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              {admin.id}
            </p>
          </div>

          {/* Account Status */}
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Account Status
            </p>

            <p className="mt-2 text-lg font-semibold text-green-600">
              Active
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;