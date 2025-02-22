import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5050/backoffice';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ category_name: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_categories`);
      setCategories(response.data);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
      <br /><br />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Categories</h2>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
            <Plus className="w-5 h-5 mr-2" /> Add Category
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map(category => (
                  <tr key={category.category_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{category.category_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{category.category_name}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(category)} className="text-blue-600 hover:text-blue-900 mr-4">
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button onClick={() => { setSelectedCategory(category); setIsDeleteModalOpen(true); }} className="text-red-600 hover:text-red-900">
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
                <h3 className="text-lg font-semibold text-gray-900">{selectedCategory ? 'Edit Category' : 'Add New Category'}</h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category Name</label>
                  <input type="text" value={formData.category_name} onChange={(e) => setFormData({ category_name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border" required />
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">{selectedCategory ? 'Update' : 'Add'} Category</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Category</h3>
              <p className="text-gray-500">Are you sure you want to delete this category? This action cannot be undone.</p>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
