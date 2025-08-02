import React from 'react';
import App from '../components/App.jsx';

export default function AIChat() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">צ'אט AI מתקדם</h1>
        <p className="text-gray-600 mt-2">שיחה קולית חכמה עם בינה מלאכותית של OpenAI</p>
      </div>

      {/* AI Chat Interface */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <h2 className="text-lg font-semibold">OpenAI Realtime Console</h2>
          <p className="text-indigo-100 text-sm">תקשורת קולית בזמן אמת עם GPT-4</p>
        </div>
        
        {/* Embed the original OpenAI Realtime Console */}
        <div className="min-h-[600px]">
          <App />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">הוראות שימוש</h3>
        <div className="space-y-2 text-blue-800">
          <p>• לחץ על "התחל שיחה" כדי להתחיל שיחה קולית עם הבינה המלאכותית</p>
          <p>• דבר בבירור והמתן לתגובה</p>
          <p>• ניתן גם לשלוח הודעות טקסט ישירות</p>
          <p>• עקוב אחרי האירועים בפאנל הכלים בצד ימין</p>
          <p>• לחץ על "עצור שיחה" כדי לסיים</p>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">שיחה קולית</h3>
          <p className="text-gray-600 text-sm">דבר ישירות עם הבינה המלאכותית בקול טבעי</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">תגובה מיידית</h3>
          <p className="text-gray-600 text-sm">קבל תגובות מהירות ומדויקות בזמן אמת</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">טכנולוגיה מתקדמת</h3>
          <p className="text-gray-600 text-sm">מבוסס על טכנולוגיית GPT-4 העדכנית ביותר</p>
        </div>
      </div>
    </div>
  );
}