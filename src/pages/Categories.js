import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5050/backoffice';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ category_name: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Filter categories whenever search term changes
    const filtered = categories.filter(category => 
      category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_categories`);
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        await axios.put(`${API_BASE_URL}/update_category/${selectedCategory.category_id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/add_category`, formData);
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({ category_name: category.category_name });
    } else {
      setSelectedCategory(null);
      setFormData({ category_name: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setFormData({ category_name: '' });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/delete_category/${selectedCategory.category_id}`);
      fetchCategories();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
              <br />
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
          <Plus className="mr-2" size={16} />
          Add Category
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            placeholder="Filter categories..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map(category => (
                    <tr key={category.category_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.category_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.category_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex">
                        <button onClick={() => handleOpenModal(category)} className="text-blue-600 hover:text-blue-900 mr-4">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => { setSelectedCategory(category); setIsDeleteModalOpen(true); }} className="text-red-600 hover:text-red-900">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? "No categories found matching your search" : "No categories available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center pb-3">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {selectedCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
                  <input id="categoryName" type="text" value={formData.category_name} onChange={(e) => setFormData({ category_name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border" required />
                </div>

                <div className="flex justify-end gap-3 mt-5">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">{selectedCategory ? 'Update' : 'Add'} Category</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Category</h3>

            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;