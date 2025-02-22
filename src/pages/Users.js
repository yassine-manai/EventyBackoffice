import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Eye } from 'lucide-react';
import axios from 'axios';
import '../services/User_Service';

const API_BASE_URL = 'http://127.0.0.1:5050/backoffice';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    event_id: [],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserEvents = async (eventIds) => {
    try {
      const eventRequests = eventIds.map(id =>
        axios.get(`${API_BASE_URL}/get_events?event_id=${id}`)
      );
      const eventResponses = await Promise.all(eventRequests);
      const events = eventResponses.map(res => res.data);
      setUserEvents(events);
    } catch (error) {
      console.error('Error fetching user events:', error);
      setUserEvents([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedEventIds = formData.event_id
      .split(',')
      .map(id => parseInt(id.trim())); // Convert string to array
    const updatedFormData = { ...formData, event_id: formattedEventIds };

    try {
      if (selectedUser) {
        await axios.put(
          `${API_BASE_URL}/update_user/${selectedUser.user_id}`,
          updatedFormData
        );
      } else {
        await axios.post(`${API_BASE_URL}/add_user`, updatedFormData);
      }
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error.response ? error.response.data : error);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({ ...user, event_id: user.event_id.join(', ') });
    } else {
      setSelectedUser(null);
      setFormData({ email: '', name: '', event_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormData({ email: '', name: '', event_id: '' });
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/delete_user/${selectedUser.user_id}`);
      fetchUsers();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    await fetchUserEvents(user.event_id);
    setIsViewModalOpen(true);
  };

  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <br />
        <br />
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Users Management</h2>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" /> Add User
          </button>
        </div>

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
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="text-green-600 hover:text-green-800   transition-colors"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="text"
                  value="1234567"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {selectedUser ? 'Update' : 'Add'} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">User Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-800">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-gray-800">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">Assigned Events</p>
                {userEvents.length > 0 ? (
                  <div className="grid gap-4">
                    {userEvents.map((event) => (
                      <div key={event.event_id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex gap-4">
                          <div className="w-32 h-32 flex-shrink-0">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                              {event.title}
                            </h4>
                            <p className="text-gray-600 mb-1">
                              {formatDate(event.start_date)} to {formatDate(event.end_date)}
                            </p>
                            <p className="text-gray-600">{event.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No events assigned.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Confirm Delete</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete this user?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
