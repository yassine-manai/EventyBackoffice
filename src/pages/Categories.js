import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { fetchCategories, addCategory, updateCategory, deleteCategory } from '../services/CategoryService';
import '../services/Category_Service';


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ category_name: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCategory) {
      await updateCategory(selectedCategory.category_id, formData);
    } else {
      await addCategory(formData);
    }
    loadCategories();
    handleCloseModal();
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
    if (selectedCategory) {
      await deleteCategory(selectedCategory.category_id);
      loadCategories();
      setIsDeleteModalOpen(false);
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
      </div>
    </div>
  );
};

export default Categories;
