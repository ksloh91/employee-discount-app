import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

function tsToDateString(value) {
  if (!value) return "—";
  const ms = value?.toMillis ? value.toMillis() : new Date(value).getTime();
  if (!Number.isFinite(ms)) return "—";
  return new Date(ms).toLocaleDateString();
}

export default function EmployeesPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, "users"), where("role", "==", "employee")),
        );
        setEmployees(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })),
        );
      } catch (error) {
        console.error("Error loading employees:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      const email = (e.email || "").toLowerCase();
      const name = (e.displayName || "").toLowerCase();
      return email.includes(q) || name.includes(q);
    });
  }, [employees, search]);

  const handleToggleStatus = async (employee) => {
    const nextStatus = employee.status === "suspended" ? "active" : "suspended";
    setSavingId(employee.id);
    try {
      await updateDoc(doc(db, "users", employee.id), { status: nextStatus });
      setEmployees((current) =>
        current.map((row) =>
          row.id === employee.id ? { ...row, status: nextStatus } : row,
        ),
      );
    } catch (error) {
      console.error("Failed to update employee status:", error);
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-50">Employees</h1>
        <p className="text-sm text-slate-400">
          View signed-up employees and manage their access.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
        <label htmlFor="employee-search" className="text-xs font-medium text-slate-400">
          Search by name or email
        </label>
        <input
          id="employee-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="e.g. alice@company.com"
          className="mt-2 h-10 w-full rounded-full border border-slate-600 bg-slate-800/80 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-primary"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading employees...</p>
      ) : filteredEmployees.length === 0 ? (
        <p className="text-sm text-slate-500">No employees found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900/50">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 font-medium text-slate-300">Employee</th>
                <th className="px-4 py-3 font-medium text-slate-300">Email</th>
                <th className="px-4 py-3 font-medium text-slate-300">Joined</th>
                <th className="px-4 py-3 font-medium text-slate-300">Status</th>
                <th className="px-4 py-3 font-medium text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => {
                const status = employee.status === "suspended" ? "suspended" : "active";
                const busy = savingId === employee.id;
                return (
                  <tr key={employee.id} className="border-b border-slate-800 last:border-0">
                    <td className="px-4 py-3 text-slate-100">
                      {employee.displayName || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{employee.email || "—"}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {tsToDateString(employee.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          status === "active" ? "text-emerald-400" : "text-amber-300"
                        }
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleToggleStatus(employee)}
                        className="rounded-full border border-slate-500 px-3 py-1 text-xs font-semibold text-slate-200 hover:border-primary hover:text-primary disabled:opacity-50"
                      >
                        {busy
                          ? "Saving..."
                          : status === "active"
                          ? "Suspend"
                          : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
