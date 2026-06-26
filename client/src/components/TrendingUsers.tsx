import { Heart, Eye } from "lucide-react";

/**
 * Trending Users Section Component
 * Design: Display active users with profile cards
 * Features: User avatars, names, ages, and online indicators
 */

interface User {
  id: string;
  name: string;
  age: number;
  online: boolean;
  views: number;
  avatar: string;
}

// Mock data - in production, this would come from an API
const trendingUsers: User[] = [
  {
    id: "1",
    name: "سارة 🌹",
    age: 22,
    online: true,
    views: 1250,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    name: "أحمد 💚",
    age: 25,
    online: true,
    views: 980,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    name: "فاطمة 💗",
    age: 20,
    online: true,
    views: 1540,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  },
  {
    id: "4",
    name: "محمد 🖤",
    age: 23,
    online: true,
    views: 1120,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
  {
    id: "5",
    name: "ليلى 👑",
    age: 21,
    online: true,
    views: 1890,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  {
    id: "6",
    name: "علي 👻",
    age: 24,
    online: true,
    views: 2100,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
  },
];

export default function TrendingUsers() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
            المستخدمون النشطون الآن
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            اتصل بأشخاص حقيقيين يبحثون عن محادثات حقيقية الآن
          </p>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingUsers.map((user) => (
            <div
              key={user.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative p-6 flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full border-4 border-purple-200 shadow-lg object-cover"
                  />
                  {/* Online indicator */}
                  {user.online && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg" />
                  )}
                </div>

                {/* User Info */}
                <h3 className="font-bold text-lg text-gray-900 mb-1">{user.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{user.age} سنة</p>

                {/* Stats */}
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <span>{user.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-pink-600" />
                    <span>نشط</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                >
                  ابدأ الدردشة
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="inline-block bg-white border-2 border-purple-600 text-purple-600 font-bold py-3 px-8 rounded-full hover:bg-purple-50 transition-all duration-300">
            عرض المزيد من المستخدمين
          </button>
        </div>
      </div>
    </section>
  );
}
