import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pkg from 'react-feather';
const { 
  BarChart3, 
  CheckSquare, 
  MessageCircle, 
  Bot, 
  Files, 
  Users,
  Clock,
  TrendingUp
} = pkg;

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      name: 'לוח בקרה',
      description: 'מעקב אחרי כל הפעילות במערכת',
      icon: BarChart3,
      href: '/dashboard',
      color: 'blue'
    },
    {
      name: 'ניהול משימות',
      description: 'צור, עקב ונהל משימות בקלות',
      icon: CheckSquare,
      href: '/tasks',
      color: 'green'
    },
    {
      name: 'צ\'אט צוות',
      description: 'תקשר עם חברי הצוות בזמן אמת',
      icon: MessageCircle,
      href: '/chat',
      color: 'purple'
    },
    {
      name: 'צ\'אט AI',
      description: 'שיחה חכמה עם בינה מלאכותית',
      icon: Bot,
      href: '/ai-chat',
      color: 'indigo'
    },
    {
      name: 'ניהול קבצים',
      description: 'העלה וארגן קבצים בצורה מאובטחת',
      icon: Files,
      href: '/files',
      color: 'yellow'
    },
    {
      name: 'פרופיל משתמש',
      description: 'נהל את הפרטים האישיים שלך',
      icon: Users,
      href: '/profile',
      color: 'red'
    }
  ];

  const stats = [
    {
      name: 'משימות פעילות',
      value: '12',
      icon: CheckSquare,
      color: 'blue'
    },
    {
      name: 'הודעות חדשות',
      value: '5',
      icon: MessageCircle,
      color: 'green'
    },
    {
      name: 'קבצים',
      value: '28',
      icon: Files,
      color: 'purple'
    },
    {
      name: 'זמן מקוון',
      value: '2.5 שעות',
      icon: Clock,
      color: 'indigo'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      purple: 'bg-purple-500 text-white',
      indigo: 'bg-indigo-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      red: 'bg-red-500 text-white'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              שלום, {user?.full_name || user?.username}! 👋
            </h1>
            <p className="text-blue-100 mt-2 text-lg">
              ברוך הבא למערכת הניהול המתקדמת
            </p>
          </div>
          <div className="hidden lg:block">
            <TrendingUp className="h-24 w-24 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">תכונות המערכת</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.name}
                to={feature.href}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 group"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${getColorClasses(feature.color)} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mr-3">
                    {feature.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">פעולות מהירות</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/tasks"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <CheckSquare className="h-5 w-5 text-blue-600 ml-3" />
            <span className="text-blue-700 font-medium">צור משימה חדשה</span>
          </Link>
          <Link
            to="/chat"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="h-5 w-5 text-green-600 ml-3" />
            <span className="text-green-700 font-medium">שלח הודעה</span>
          </Link>
          <Link
            to="/files"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Files className="h-5 w-5 text-purple-600 ml-3" />
            <span className="text-purple-700 font-medium">העלה קובץ</span>
          </Link>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">מידע על המערכת</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <strong>גרסה:</strong> 1.0.0
          </div>
          <div>
            <strong>סטטוס:</strong> <span className="text-green-600">פעיל</span>
          </div>
          <div>
            <strong>עדכון אחרון:</strong> {new Date().toLocaleDateString('he-IL')}
          </div>
        </div>
      </div>
    </div>
  );
}