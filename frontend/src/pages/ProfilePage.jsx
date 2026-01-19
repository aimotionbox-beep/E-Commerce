import React, { useState, useEffect } from 'react';
import { User, Package, Heart, MapPin, Wallet, Phone, Mail, Calendar, ChevronRight, Lock, LogOut, Edit2 } from 'lucide-react';

const ProfilePage = ({ token, backendUrl }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    fetchProfileData();
  }, [token]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile data...');
      console.log('Backend URL:', backendUrl);
      console.log('Token:', token);
      
      const response = await fetch(backendUrl + '/api/user/profile-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        }
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setProfileData(data.data);
        setEditForm({
          name: data.data.user.name,
          phone: data.data.user.phone
        });
      } else {
        console.error('API Error:', data.message);
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to load profile data', error);
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(backendUrl + '/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (data.success) {
        alert('Profile updated successfully');
        setIsEditing(false);
        fetchProfileData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile');
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('deliver')) return 'text-green-600 bg-green-50';
    if (statusLower.includes('ship')) return 'text-blue-600 bg-blue-50';
    if (statusLower.includes('cancel')) return 'text-red-600 bg-red-50';
    if (statusLower.includes('placed') || statusLower.includes('process')) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const StatCard = ({ icon: Icon, title, value, bgColor }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
      <Icon className="w-5 h-5 text-gray-400 mr-3" />
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );

  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200 mb-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold text-gray-900 text-sm">{String(order.id).slice(-8)}</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{order.date}</span>
            <span className="font-semibold text-gray-900">{order.amount}</span>
          </div>
        </div>
        <button className="flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
          View Order
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const ActionButton = ({ icon: Icon, label, variant = 'default', onClick }) => {
    const baseClasses = "flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors duration-200";
    const variantClasses = variant === 'danger' 
      ? "text-red-600 hover:bg-red-50" 
      : "text-gray-700 hover:bg-gray-50";
    
    return (
      <button className={`${baseClasses} ${variantClasses}`} onClick={onClick}>
        <Icon className="w-5 h-5" />
        {label}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load profile data</p>
          <button onClick={fetchProfileData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, statistics, recentOrders, defaultAddress } = profileData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.avatar}
            </div>
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full Name"
                  />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone Number"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                </>
              )}
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({ name: user.name, phone: user.phone });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Package} title="Total Orders" value={statistics.totalOrders} bgColor="bg-blue-500" />
          <StatCard icon={Heart} title="Wishlist Items" value={statistics.wishlistItems} bgColor="bg-pink-500" />
          <StatCard icon={MapPin} title="Saved Addresses" value={statistics.savedAddresses} bgColor="bg-green-500" />
          <StatCard icon={Wallet} title="Reward Points" value={statistics.rewardPoints} bgColor="bg-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-1">
                <InfoRow icon={User} label="Full Name" value={user.name} />
                <InfoRow icon={Phone} label="Phone Number" value={user.phone || 'Not provided'} />
                <InfoRow icon={Mail} label="Email Address" value={user.email} />
                <InfoRow icon={Calendar} label="Member Since" value={user.dateJoined} />
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              </div>
              <div>
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No orders yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Default Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Default Address</h2>
              {defaultAddress ? (
                <div className="mb-4">
                  <p className="font-semibold text-gray-900 mb-1">{defaultAddress.name}</p>
                  <p className="text-sm text-gray-600 mb-1">{defaultAddress.street}</p>
                  <p className="text-sm text-gray-600 mb-1">{defaultAddress.city}</p>
                  <p className="text-sm text-gray-600">Phone: {defaultAddress.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">No address saved yet</p>
              )}
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium">
                Manage Addresses
              </button>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2 px-2">Account Actions</h2>
              <div className="space-y-1">
                <ActionButton icon={Lock} label="Change Password" />
                <ActionButton 
                  icon={LogOut} 
                  label="Logout" 
                  variant="danger"
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;