import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Eye, UploadCloud, Calendar, MapPin, Tag, Users, DollarSign, Search, Filter, ChevronDown, X as CloseIcon } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://172.16.19.118:5050/backoffice';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventUsers, setEventUsers] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: '',
    location: '',
    category: '',
    image: '',
    price: '',
    min_capacity: '',
    max_capacity: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: [],
    dateRange: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    min_capacity: '',
    max_capacity: '',
  });
  const [activeFilters, setActiveFilters] = useState(0);

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (cat) => parseInt(cat.category_id) === parseInt(categoryId)
    );
    return category ? category.category_name : categoryId;
  };

  useEffect(() => {
    fetchEvents();
    fetchCategories();
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
      setCategories(response.data);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isDateInPast = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(dateString);
    return checkDate < today;
  };

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    if (isDateInPast(selectedDate)) {
      alert("Start date cannot be in the past.");
      return;
    }
    setFormData({ ...formData, start_date: selectedDate });
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    if (isDateInPast(selectedDate)) {
      alert("End date cannot be in the past.");
      return;
    }
    if (selectedDate < formData.start_date) {
      alert("End date must be after the start date.");
      return;
    }
    setFormData({ ...formData, end_date: selectedDate });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        category: parseInt(formData.category),
        price: parseFloat(formData.price),
        min_capacity: parseInt(formData.min_capacity),
        max_capacity: parseInt(formData.max_capacity)
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
          user_id: eventDetails.user_id,
          price: eventDetails.price,
          min_capacity: eventDetails.min_capacity,
          max_capacity: eventDetails.max_capacity
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
        user_id: [],
        price: '',
        min_capacity: '',
        max_capacity: ''
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
      user_id: [],
      price: '',
      min_capacity: '',
      max_capacity: ''
    });

    setImageFile(null);
    setEventUsers([]);
  };

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
  const validateFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return false;
    }
    return true;
  };

  const handleToggleCategory = (categoryId) => {
    if (filters.category.includes(categoryId)) {
      setFilters({
        ...filters,
        category: filters.category.filter(id => id !== categoryId)
      });
    } else {
      setFilters({
        ...filters,
        category: [...filters.category, categoryId]
      });
    }
  };

  const applyFilters = () => {
    let result = [...events];
    let activeFilterCount = 0;

    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      );
      activeFilterCount++;
    }

    // Category filter
    if (filters.category.length > 0) {
      result = result.filter(event =>
        filters.category.map(String).includes(String(event.category))
      );
      activeFilterCount++;
    }

    // Date range filter
    const today = new Date();
    if (filters.dateRange) {
      switch (filters.dateRange) {
        case 'upcoming':
          result = result.filter(event => new Date(event.start_date) > today);
          break;
        case 'past':
          result = result.filter(event => new Date(event.end_date) < today);
          break;
        case 'ongoing':
          result = result.filter(event => {
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);
            return startDate <= today && endDate >= today;
          });
          break;
        default:
          break;
      }
      activeFilterCount++;
    }

    // Price range filter
    if (filters.minPrice !== '') {
      result = result.filter(event => parseFloat(event.price) >= parseFloat(filters.minPrice));
      activeFilterCount++;
    }
    if (filters.maxPrice !== '') {
      result = result.filter(event => parseFloat(event.price) <= parseFloat(filters.maxPrice));
      activeFilterCount++;
    }

    // Location filter
    if (filters.location.trim()) {
      result = result.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
      activeFilterCount++;
    }

    // Capacity filter
    if (filters.min_capacity!== '') {
      result = result.filter(event => parseInt(event.capacity) >= parseInt(filters.min_capacity));
      activeFilterCount++;
    }
    if (filters.max_capacity !== '') {
      result = result.filter(event => parseInt(event.capacity) <= parseInt(filters.max_capacity));
      activeFilterCount++;
    }

    setFilteredEvents(result);
    setActiveFilters(activeFilterCount);
  };

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateFileSize(file)) {
        alert('Image size should not exceed 3MB');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
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

  const resetFilters = () => {
    setFilters({
      search: '',
      category: [],
      dateRange: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      min_capacity: '',
      max_capacity: ''
        });
  };

  const getEventStatus = (event) => {
    const today = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (startDate > today) {
      return "upcoming";
    } else if (endDate < today) {
      return "past";
    } else {
      return "ongoing";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <br /><br />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Events</h2>
          <div className="flex gap-4">
            {/* Main Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center relative"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              {activeFilters > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 text-xs rounded-full bg-purple-600 text-white flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
            
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Event
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterDrawerOpen && (
          <div className="bg-white rounded-xl shadow-md mb-6 p-5 animate-in slide-in-from-top duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filter Events</h3>
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Reset Filters
                </button>
                <button 
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="dateRange"
                      value=""
                      checked={filters.dateRange === ''}
                      onChange={() => setFilters({ ...filters, dateRange: '' })}
                      className="h-4 w-4 text-purple-600"
                    />
                    <span className="ml-2 text-gray-700">All Events</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="dateRange"
                      value="upcoming"
                      checked={filters.dateRange === 'upcoming'}
                      onChange={() => setFilters({ ...filters, dateRange: 'upcoming' })}
                      className="h-4 w-4 text-purple-600"
                    />
                    <span className="ml-2 text-gray-700">Upcoming Events</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="dateRange"
                      value="ongoing"
                      checked={filters.dateRange === 'ongoing'}
                      onChange={() => setFilters({ ...filters, dateRange: 'ongoing' })}
                      className="h-4 w-4 text-purple-600"
                    />
                    <span className="ml-2 text-gray-700">Ongoing Events</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="dateRange"
                      value="past"
                      checked={filters.dateRange === 'past'}
                      onChange={() => setFilters({ ...filters, dateRange: 'past' })}
                      className="h-4 w-4 text-purple-600"
                    />
                    <span className="ml-2 text-gray-700">Past Events</span>
                  </label>
                </div>
              </div>
              
              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Min ($)</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg shadow-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Max ($)</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg shadow-sm"
                      placeholder="Any"
                    />
                  </div>
                </div>
              </div>
              
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm"
                  placeholder="Enter location"
                />
              </div>
              
              {/* Category Filter */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <div
                      key={category.category_id}
                      onClick={() => handleToggleCategory(String(category.category_id))}
                      className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                        filters.category.includes(String(category.category_id))
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      } border`}
                    >
                      {category.category_name}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Capacity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Min</label>
                    <input
                      type="number"
                      value={filters.min_capacity}
                      onChange={(e) => setFilters({
                        ...filters,
                        capacity: { ...filters.min_capacity, min_capacity: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg shadow-sm"
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Max</label>
                    <input
                      type="number"
                      value={filters.max_capacity}
                      onChange={(e) => setFilters({
                        ...filters,
                        capacity: { ...filters.max_capacity, max_capacity: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg shadow-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <div className="flex items-center bg-purple-50 text-purple-700 rounded-full px-3 py-1 text-sm">
                      <span>Search: {filters.search}</span>
                      <button 
                        onClick={() => setFilters({ ...filters, search: '' })}
                        className="ml-2 text-purple-500 hover:text-purple-700"
                      >
                        <CloseIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {filters.category.length > 0 && (
                    <div className="flex items-center bg-purple-50 text-purple-700 rounded-full px-3 py-1 text-sm">
                      <span>Categories: {filters.category.length}</span>
                      <button 
                        onClick={() => setFilters({ ...filters, category: [] })}
                        className="ml-2 text-purple-500 hover:text-purple-700"
                      >
                        <CloseIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {filters.dateRange && (
                    <div className="flex items-center bg-purple-50 text-purple-700 rounded-full px-3 py-1 text-sm">
                      <span>Date: {filters.dateRange.charAt(0).toUpperCase() + filters.dateRange.slice(1)}</span>
                      <button 
                        onClick={() => setFilters({ ...filters, dateRange: '' })}
                        className="ml-2 text-purple-500 hover:text-purple-700"
                      >
                        <CloseIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {(filters.minPrice !== '' || filters.maxPrice !== '') && (
                    <div className="flex items-center bg-purple-50 text-purple-700 rounded-full px-3 py-1 text-sm">
                      <span>
                        Price: 
                        {filters.minPrice !== '' ? ` $${filters.minPrice}` : ' $0'} 
                        {filters.maxPrice !== '' ? ` - $${filters.maxPrice}` : '+'}
                      </span>
                      <button 
                        onClick={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })}
                        className="ml-2 text-purple-500 hover:text-purple-700"
                      >
                        <CloseIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {filters.location && (
                    <div className="flex items-center bg-purple-50 text-purple-700 rounded-full px-3 py-1 text-sm">
                      <span>Location: {filters.location}</span>
                      <button 
                        onClick={() => setFilters({ ...filters, location: '' })}
                        className="ml-2 text-purple-500 hover:text-purple-700"
                      >
                        <CloseIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {(filters.min_capacity !== '' || filters.max_capacity!== '') && (
                    <div className="flex items-center bg-purple-50 text-purple-700 rounded-full px-3 py-1 text-sm">
                      <span>
                        Capacity: 
                        {filters.min_capacity !== '' ? ` ${filters.min_capacity}` : ' Any'} 
                        {filters.max_capacity!== '' ? ` - ${filters.min_capacity}` : '+'}
                      </span>
                      <button 
                        onClick={() => setFilters({ ...filters, min_capacity: '', max_capacity: '' })}
                        className="ml-2 text-purple-500 hover:text-purple-700"
                      >
                        <CloseIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Stats */}
        <div className="bg-white rounded-lg p-3 mb-4 flex justify-between items-center">
          <div className="text-gray-600">
            {filteredEvents.length === 0 ? (
              "No events found"
            ) : (
              <>
                Showing <span className="font-semibold">{filteredEvents.length}</span> {filteredEvents.length === 1 ? 'event' : 'events'}
                {events.length !== filteredEvents.length ? ` out of ${events.length}` : ''}
              </>
            )}
          </div>
          {activeFilters > 0 && (
            <button 
              onClick={resetFilters}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {activeFilters > 0 
                  ? "Try adjusting your filters to see more results." 
                  : "There are no events to display. Create your first event."}
              </p>
              {activeFilters > 0 && (
                <button
                  onClick={resetFilters}
                  className="px-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="max-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
               <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => {
                    const status = getEventStatus(event);
                    return (
                      <tr key={event.event_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {event.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(event.start_date)}
                            <span className="mx-1">→</span>
                            {formatDate(event.end_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            {event.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {getCategoryName(event.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            <DollarSign className="h-4 w-4 inline mr-1 text-gray-400" />
                            {parseFloat(event.price).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            <Users className="h-4 w-4 inline mr-1 text-gray-400" />
                            {event.min_capacity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            <Users className="h-4 w-4 inline mr-1 text-gray-400" />
                            {event.max_capacity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            status === "upcoming" 
                              ? "bg-blue-100 text-blue-800" 
                              : status === "ongoing" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                          }`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleViewDetails(event)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(event)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(event)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
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
      </div>

      {/* Add/Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedEvent ? 'Edit Event' : 'Add Event'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter event location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={handleStartDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={handleEndDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.min_capacity}
                    onChange={(e) => setFormData({ ...formData, min_capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter Minimum capacity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter Max capacity"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Image
                  </label>
                  <div className="mt-1 flex items-center space-x-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center w-full">
                      <div className="text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2 flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="sr-only" 
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 3MB</p>
                      </div>
                    </div>
                    {formData.image && (
                      <div className="shrink-0 h-24 w-24 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {selectedEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {isViewModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-700">Dates</div>
                        <div>{formatDate(selectedEvent.start_date)} - {formatDate(selectedEvent.end_date)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-700">Location</div>
                        <div>{selectedEvent.location}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-700">Category</div>
                        <div>{getCategoryName(selectedEvent.category)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-700">Price</div>
                        <div>${parseFloat(selectedEvent.price).toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-700">Min Capacity</div>
                        <div>{selectedEvent.min_capacity} attendees</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-700">Max Capacity</div>
                        <div>{selectedEvent.max_capacity} attendees</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Delete Event</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the event "{selectedEvent.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
      )}
    </div>
  );
};

export default Events;