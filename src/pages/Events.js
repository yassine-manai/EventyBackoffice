import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Eye } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5050/backoffice';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventUsers, setEventUsers] = useState([]);
  const [categories, setCategories] = useState([]); // State to store categories
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: '',
    location: '',
    category: '', // This will store the selected category ID
    image: '',
    user_id: []
  });
  const [imageFile, setImageFile] = useState(null);

  // Helper function to get category name by its ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (cat) => parseInt(cat.category_id) === parseInt(categoryId)
    );
    return category ? category.category_name : categoryId;
  };

  useEffect(() => {
    fetchEvents();
    fetchCategories(); // Fetch categories when the component mounts
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_categories`);
      setCategories(response.data); // Store the fetched categories
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchEventUsers = async (userIds) => {
    try {
      const userRequests = userIds.map(id =>
        axios.get(`${API_BASE_URL}/get_users?user_id=${id}`)
      );
      const userResponses = await Promise.all(userRequests);
      const users = userResponses.map(res => res.data);
      setEventUsers(users);
    } catch (error) {
      console.error('Error fetching event users:', error);
      setEventUsers([]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        category: parseInt(formData.category), // Ensure category is an integer
        user_id: Array.isArray(formData.user_id)
          ? formData.user_id
          : formData.user_id.split(',').map(id => parseInt(id.trim()))
      };

      if (selectedEvent) {
        await axios.put(`${API_BASE_URL}/update_event/${selectedEvent.event_id}`, submitData);
      } else {
        await axios.post(`${API_BASE_URL}/add_event`, submitData);
      }
      fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleOpenModal = async (event = null) => {
    if (event) {
      setSelectedEvent(event);
      const eventDetails = await fetchEventById(event.event_id);
      if (eventDetails) {
        setFormData({
          title: eventDetails.title,
          start_date: eventDetails.start_date,
          end_date: eventDetails.end_date,
          location: eventDetails.location,
          category: eventDetails.category,
          image: eventDetails.image,
          user_id: eventDetails.user_id
        });
        await fetchEventUsers(eventDetails.user_id);
      }
    } else {
      setSelectedEvent(null);
      setFormData({
        title: '',
        start_date: '',
        end_date: '',
        location: '',
        category: '',
        image: '',
        user_id: []
      });
      setEventUsers([]);
    }
    setIsModalOpen(true);
  };

  const fetchEventById = async (eventId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_events?event_id=${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event details:', error);
      return null;
    }
  };

  const handleViewDetails = async (event) => {
    setSelectedEvent(event);
    const eventDetails = await fetchEventById(event.event_id);
    if (eventDetails) {
      await fetchEventUsers(eventDetails.user_id);
    }
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedEvent(null);
    setFormData({
      title: '',
      start_date: '',
      end_date: '',
      location: '',
      category: '',
      image: '',
      user_id: []
    });
    setImageFile(null);
    setEventUsers([]);
  };

  const handleDelete = async (event) => {
    setSelectedEvent(event);
    const eventDetails = await fetchEventById(event.event_id);
    if (eventDetails) {
      await fetchEventUsers(eventDetails.user_id);
    }
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/delete_event/${selectedEvent.event_id}`);
      fetchEvents();
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
      setEventUsers([]);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <br />
        <br />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Events</h2>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Event
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.event_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.start_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.end_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryName(event.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(event)}
                        className="text-gray-600 hover:text-gray-900 mr-4"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(event)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(event)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                    />

                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="mt-2 w-32 h-32 rounded-lg object-cover"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {selectedEvent ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Confirm Delete
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
                </p>
                {eventUsers.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      This event is assigned to:
                    </p>
                    <div className="space-y-1">
                      {eventUsers.map((user, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {user.name} ({user.email})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isViewModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Event Details
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <img
                    src={selectedEvent?.image}
                    alt={selectedEvent?.title}
                    className="w-full h-48 rounded-lg object-cover mb-4"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Title</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedEvent?.title}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Date</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedEvent?.start_date} to {selectedEvent?.end_date}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Location</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedEvent?.location}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Category</h4>
                    <p className="mt-1 text-sm text-gray-900">{getCategoryName(selectedEvent?.category)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Assigned Users</h4>
                    <div className="mt-2 space-y-2">
                      {eventUsers.map((user, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
