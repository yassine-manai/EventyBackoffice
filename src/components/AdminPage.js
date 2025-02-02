import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FolderTree,
  Calendar,
  ArrowUp,
  ArrowDown,
  BarChart2,
  Clock
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, bgColor, textColor, link, trend, lastUpdate }) => (
  <Link to={link}>
    <div className={`p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ${bgColor} border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            <span className="px-2 py-1 text-xs font-medium bg-white rounded-full text-gray-600 bg-opacity-50">
              {lastUpdate}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {trend && (
            <div className={`flex items-center space-x-1 ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${textColor} bg-white bg-opacity-30`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          <span>Last updated 2 hours ago</span>
        </div>
      </div>
    </div>
  </Link>
);

const QuickStats = () => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div className="bg-indigo-50 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-indigo-600 font-medium">Active Now</p>
        <p className="text-2xl font-bold text-indigo-700">28</p>
      </div>
      <div className="bg-indigo-100 p-2 rounded-full">
        <Users className="w-5 h-5 text-indigo-600" />
      </div>
    </div>
    <div className="bg-emerald-50 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-emerald-600 font-medium">Today's Events</p>
        <p className="text-2xl font-bold text-emerald-700">12</p>
      </div>
      <div className="bg-emerald-100 p-2 rounded-full">
        <Calendar className="w-5 h-5 text-emerald-600" />
      </div>
    </div>
  </div>
);

const DashboardStats = () => {
  const [stats, setStats] = useState({
    categories: { value: 0, trend: 0 },
    events: { value: 0, trend: 0 },
    users: { value: 0, trend: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setStats({
          categories: { value: 8, trend: 12.5 },
          events: { value: 8, trend: -5.2 },
          users: { value: 8, trend: 8.7 },
        });
      } catch (err) {
        setError("Error loading dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 rounded-xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              <br></br>
              Welcome to the Dashboard
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              Manage your categories, events, and users with ease
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Time</p>
            <p className="text-lg font-semibold text-gray-700">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <QuickStats />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Categories"
          value={stats.categories.value}
          trend={stats.categories.trend}
          icon={FolderTree}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
          link="/categories"
          lastUpdate="Today"
        />
        <StatCard
          title="Events"
          value={stats.events.value}
          trend={stats.events.trend}
          icon={Calendar}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          link="/events"
          lastUpdate="Today"
        />
        <StatCard
          title="Users"
          value={stats.users.value}
          trend={stats.users.trend}
          icon={Users}
          bgColor="bg-green-50"
          textColor="text-green-600"
          link="/users"
          lastUpdate="Today"
        />
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Recent Activity</h3>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-200">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">New event created</p>
                  <p className="text-sm text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700">View</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;