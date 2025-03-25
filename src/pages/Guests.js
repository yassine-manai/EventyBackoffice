import React, { useEffect, useState } from 'react';
import { Trash2, X, CheckCircle, XCircle, Search, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5050/backoffice';

const Guests = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, filters]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/get_guests`);
      setUsers(response.data);
      setFilteredUsers(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching guests:', error);
      setError('Failed to load guests. Please try again later.');
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];

    // Apply search term to name and email
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        user => 
          user.name?.toLowerCase().includes(term) || 
          user.email?.toLowerCase().includes(term)
      );
    }

    // Apply specific filters
    if (filters.name) {
      result = result.filter(user => 
        user.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.email) {
      result = result.filter(user => 
        user.email?.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    setFilteredUsers(result);
  };

  const handleAccept = async (user) => {
    try {
      await axios.post(`${API_BASE_URL}/accept_guest/${user.user_id}`);
      setSuccessMessage(`Successfully accepted ${user.name}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchUsers();
    } catch (error) {
      console.error('Error accepting guests:', error);
      setError(`Failed to accept ${user.name}. Please try again.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDecline = async () => {
    try {
      await axios.post(`${API_BASE_URL}/decline_guest/${selectedUser.user_id}`);
      setSuccessMessage(`Successfully declined ${selectedUser.name}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchUsers();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error declining guests:', error);
      setError(`Failed to decline ${selectedUser.name}. Please try again.`);
      setTimeout(() => setError(null), 3000);
      setIsDeleteModalOpen(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      email: '',
    });
    setSearchTerm('');
    setFilteredUsers(users);
    setIsFilterModalOpen(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <br /><br />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Guests Management</h2>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center gap-2"
            title="Refresh guest list"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Notification Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Filter className="w-5 h-5 text-gray-500" />
                <span>Filters</span>
                {Object.values(filters).some(val => val !== '') && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-purple-600 rounded-full">
                    {Object.values(filters).filter(val => val !== '').length}
                  </span>
                )}
              </button>
              {Object.values(filters).some(val => val !== '') && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-2"></div>
              <p className="text-gray-600">Loading guests...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.email} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-800">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{user.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleAccept(user)}
                              className="p-1 text-green-600 hover:text-green-800 transition-colors hover:bg-green-50 rounded-full"
                              title="Accept guest"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors hover:bg-red-50 rounded-full"
                              title="Decline guest"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                        {searchTerm || Object.values(filters).some(val => val !== '') 
                          ? "No guests found matching your search criteria."
                          : "No pending guest requests."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Filter Guests</h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Filter by name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  value={filters.email}
                  onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Filter by email"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Confirm Decline</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">
                    Are you sure you want to decline this guest request from <span className="font-medium">{selectedUser?.name}</span> ({selectedUser?.email})?
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDecline}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;