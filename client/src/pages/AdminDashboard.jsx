import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const API_URL = "http://localhost:5000/api/admin/users";

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_URL}?page=${page}&limit=10&search=${search}`,
        { withCredentials: true },
      );
      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r shadow-sm hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-6 flex flex-col gap-2 px-4">
          <a
            href="#"
            className="p-3 bg-blue-50 text-blue-700 rounded-lg font-medium"
          >
            Users
          </a>
          <a href="#" className="p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            Organizations
          </a>
          <a href="#" className="p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            Settings
          </a>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
          <input
            type="text"
            placeholder="Search by username or email..."
            className="p-2 border rounded-lg w-64 shadow-sm focus:ring focus:ring-blue-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center p-10 text-gray-500">Loading users...</div>
        ) : error ? (
          <div className="text-center p-10 text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-10 text-gray-500 bg-white rounded-lg shadow">
            No users found.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Platform Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt="avatar"
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          user.username[0]
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.platformRole === "PLATFORM_ADMIN" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {user.platformRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center p-4 border-t">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className={`px-4 py-2 border rounded ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages || 1}
              </span>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(page + 1)}
                className={`px-4 py-2 border rounded ${page === totalPages || totalPages === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
