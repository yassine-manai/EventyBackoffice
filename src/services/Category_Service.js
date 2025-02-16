// services/CategoryService.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5050/backoffice';

export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const addCategory = async (formData) => {
  try {
    await axios.post(`${API_BASE_URL}/add_category`, formData);
  } catch (error) {
    console.error('Error adding category:', error);
  }
};

export const updateCategory = async (categoryId, formData) => {
  try {
    await axios.put(`${API_BASE_URL}/update_category/${categoryId}`, formData);
  } catch (error) {
    console.error('Error updating category:', error);
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    await axios.delete(`${API_BASE_URL}/delete_category/${categoryId}`);
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};
