import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [debates, setDebates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is admin or moderator
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      navigate('/');
      return;
    }

    if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'debates') {
      fetchDebates();
    } else if (activeTab === 'users' && user.role === 'admin') {
      fetchUsers();
    }
  }, [activeTab, user]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchDebates = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllDebates();
      setDebates(response.data);
    } catch (error) {
      console.error('Failed to fetch debates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDebateStatusChange = async (debateId, newStatus) => {
    try {
      await adminAPI.updateDebateStatus(debateId, newStatus);
      fetchDebates();
      alert('Debate status updated!');
    } catch (error) {
      alert('Failed to update debate status');
    }
  };

  const handleDeleteDebate = async (debateId) => {
    if (!window.confirm('Are you sure you want to delete this debate?')) return;

    try {
      await adminAPI.deleteDebate(debateId);
      fetchDebates();
      alert('Debate deleted!');
    } catch (error) {
      alert('Failed to delete debate');
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchUsers();
      alert('User role updated!');
    } catch (error) {
      alert('Failed to update user role');
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      await adminAPI.toggleUserBan(userId);
      fetchUsers();
      alert('User status updated!');
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {user.role === 'admin' ? '👑 Admin' : '🛡️ Moderator'} Dashboard
          </h1>
          <p className="text-gray-500">Manage debates, users, and platform settings</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'stats'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Statistics
            </button>
            <button
              onClick={() => setActiveTab('debates')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'debates'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💬 Debates
            </button>
            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 font-semibold ${
                  activeTab === 'users'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                👥 Users
              </button>
            )}
          </div>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.total_users}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Total Debates</p>
              <p className="text-3xl font-bold text-green-600">{stats.total_debates}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Active Debates</p>
              <p className="text-3xl font-bold text-blue-600">{stats.active_debates}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Admins</p>
              <p className="text-3xl font-bold text-purple-600">{stats.users_by_role.admin}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm md:col-span-2 lg:col-span-4">
              <h3 className="font-bold text-lg mb-4">Users by Role</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Admins</p>
                  <p className="text-2xl font-bold">{stats.users_by_role.admin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Moderators</p>
                  <p className="text-2xl font-bold">{stats.users_by_role.moderator}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verified Users</p>
                  <p className="text-2xl font-bold">{stats.users_by_role.verified_user}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="text-2xl font-bold">{stats.users_by_role.guest}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debates Tab */}
        {activeTab === 'debates' && (
          <div className="bg-white rounded-lg shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Votes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {debates.map((debate) => (
                      <tr key={debate.id}>
                        <td className="px-6 py-4">
                          <a href={`/debate/${debate.id}`} className="text-indigo-600 hover:underline">
                            {debate.topic}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={debate.status}
                            onChange={(e) => handleDebateStatusChange(debate.id, e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="closed">Closed</option>
                            <option value="locked">Locked</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-green-600">{debate.pro_votes}</span> /{' '}
                          <span className="text-red-600">{debate.con_votes}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(debate.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteDebate(debate.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab (Admin Only) */}
        {activeTab === 'users' && user.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 font-medium">{u.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                            disabled={u.id === user.id}
                          >
                            <option value="guest">Guest</option>
                            <option value="verified_user">Verified User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            u.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {u.is_active ? 'Active' : 'Banned'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleBan(u.id)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            disabled={u.id === user.id}
                          >
                            {u.is_active ? 'Ban' : 'Unban'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;