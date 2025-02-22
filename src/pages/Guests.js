import React, { useEffect, useState } from 'react';
import { Trash2, X, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5050/backoffice';

const Guests = () => {
  const [users, setUsers] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_guests`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

  const handleAccept = async (user) => {
    try {
      await axios.post(`${API_BASE_URL}/accept_guest/${user.user_id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error accepting guests:', error);
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDecline = async () => {
    try {
      await axios.post(`${API_BASE_URL}/decline_guest/${selectedUser.user_id}`);
      fetchUsers();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error declining guests:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
                <br /><br />

      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Guests Management</h2>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                {users.map((user) => (
                  <tr key={user.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{user.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleAccept(user)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Decline Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
            <p className="text-sm text-gray-700">Are you sure you want to decline this user ?</p>
            <div className="flex justify-end gap-3 mt-4">
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
