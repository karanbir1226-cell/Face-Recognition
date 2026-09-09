import { useEffect, useState } from "react";

function StudentClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token =
          localStorage.getItem("studentToken") ||
          localStorage.getItem("student_token") ||
          localStorage.getItem("access_token") ||
          localStorage.getItem("token");

        if (!token) {
          setError("Student login token not found.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://127.0.0.1:8000/classes/my-classes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load classes");
        }

        setClasses(data.classes || []);
      } catch (err) {
        console.error("My Classes error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your classes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Academics
        </p>

        <div className="mt-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              My Classes
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View the classes you have joined.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-full bg-slate-100 px-4 py-2">
            <span className="text-sm font-semibold text-slate-600">
              {classes.length} {classes.length === 1 ? "Class" : "Classes"}
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <div>
            <p className="font-semibold text-red-800">
              Unable to load classes
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Classes */}
      {!error && (
        <>
          {classes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                📚
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                No Classes Joined
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                You have not joined any class yet. Your enrolled classes
                will appear here.
              </p>

            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">

              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                >

                  {/* Card Header */}
                  <div className="border-b border-slate-100 p-6">

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xl text-white">
                          ▣
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Class
                          </p>

                          <h2 className="mt-1 text-lg font-bold leading-6 text-slate-900">
                            {classItem.class_name}
                          </h2>
                        </div>

                      </div>

                      <span className="shrink-0 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                        Joined
                      </span>

                    </div>

                  </div>

                  {/* Card Details */}
                  <div className="p-6">

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Class Code
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-3">

                        <p className="font-mono text-lg font-bold tracking-wider text-slate-900">
                          {classItem.class_code}
                        </p>

                        <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-500 shadow-sm">
                          Code
                        </span>

                      </div>

                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        ✓
                      </span>

                      <span>
                        You are enrolled in this class.
                      </span>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}
        </>
      )}

    </div>
  );
}

export default StudentClasses;