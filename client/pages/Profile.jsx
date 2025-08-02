import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import pkg from 'react-feather';
const { User, Mail, Edit3, Save, X } = pkg;

export default function Profile() {
  const { user, api } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await api(`/api/users/${user.id}`, {
        method: 'PUT',
        body: formData
      });
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || ''
    });
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">פרופיל משתמש</h1>
        <p className="text-gray-600 mt-1">נהל את המידע האישי שלך</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-12">
          <div className="flex items-center">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <div className="mr-6 text-white">
              <h2 className="text-2xl font-bold">{user?.full_name || user?.username}</h2>
              <p className="text-blue-100">{user?.email}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-white bg-opacity-20">
                <span className="w-2 h-2 bg-green-400 rounded-full ml-2"></span>
                פעיל
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">פרטים אישיים</h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit3 className="h-4 w-4 ml-2" />
                ערוך
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 ml-2" />
                  {loading ? 'שומר...' : 'שמור'}
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="h-4 w-4 ml-2" />
                  ביטול
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם מלא
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user?.full_name || 'לא הוגדר'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                כתובת אימייל
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם משתמש
              </label>
              <p className="text-gray-900">{user?.username}</p>
              <p className="text-sm text-gray-500">לא ניתן לשנות</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תפקיד
              </label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user?.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {user?.role === 'admin' ? 'מנהל' : 'משתמש'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">פרטי חשבון</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">תאריך הצטרפות</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('he-IL') : 'לא זמין'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">התחברות אחרונה</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user?.last_login ? new Date(user.last_login).toLocaleDateString('he-IL') : 'לא זמין'}
            </dd>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">הגדרות אבטחה</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">שינוי סיסמה</h4>
              <p className="text-sm text-gray-500">עדכן את הסיסמה שלך</p>
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              שנה סיסמה
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">אימות דו-שלבי</h4>
                <p className="text-sm text-gray-500">הוסף שכבת אבטחה נוספת לחשבון</p>
              </div>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                הגדר
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}