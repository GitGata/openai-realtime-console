import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import pkg from 'react-feather';
const { 
  Users, 
  CheckSquare, 
  FileText, 
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity
} = pkg;

export default function Dashboard() {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await api('/api/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'סה"כ משתמשים',
      value: stats?.users || 0,
      icon: Users,
      color: 'blue',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'משימות פעילות',
      value: stats?.pendingTasks || 0,
      icon: CheckSquare,
      color: 'yellow',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'משימות הושלמו',
      value: stats?.completedTasks || 0,
      icon: CheckSquare,
      color: 'green',
      change: '+23%',
      changeType: 'increase'
    },
    {
      name: 'קבצים במערכת',
      value: stats?.files || 0,
      icon: FileText,
      color: 'purple',
      change: '+5%',
      changeType: 'increase'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      purple: 'bg-purple-500 text-white',
      red: 'bg-red-500 text-white'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">לוח בקרה</h1>
          <p className="text-gray-600 mt-1">סקירה כללית של פעילות המערכת</p>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 ml-2" />
          עודכן לאחרונה: {new Date().toLocaleTimeString('he-IL')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mr-4">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 ml-1" />
                  )}
                  <span className={stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">פעילות שבועית</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {/* Simple bar chart representation */}
            <div className="space-y-3">
              {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day, index) => {
                const activity = Math.random() * 100;
                return (
                  <div key={day} className="flex items-center">
                    <div className="w-16 text-sm text-gray-600">{day}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${activity}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-gray-600 text-left">
                      {Math.round(activity)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">משימות אחרונות</h2>
            <CheckSquare className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats?.recentTasks && stats.recentTasks.length > 0 ? (
              stats.recentTasks.map((task) => (
                <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ml-3 ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      {task.assigned_to_username ? `הוקצה ל: ${task.assigned_to_username}` : 'לא הוקצה'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(task.created_at).toLocaleDateString('he-IL')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>אין משימות אחרונות</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">בריאות המערכת</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            </div>
            <h3 className="font-medium text-gray-900">שרת</h3>
            <p className="text-sm text-green-600">פעיל</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            </div>
            <h3 className="font-medium text-gray-900">בסיס נתונים</h3>
            <p className="text-sm text-green-600">פעיל</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            </div>
            <h3 className="font-medium text-gray-900">API</h3>
            <p className="text-sm text-green-600">פעיל</p>
          </div>
        </div>
      </div>
    </div>
  );
}