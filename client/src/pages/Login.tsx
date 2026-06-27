import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import { Heart, Video } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Login() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const saveProfileMutation = trpc.users.saveProfile.useMutation();

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !gender) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    if (!user) {
      setError('يجب تسجيل الدخول أولاً');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // حفظ البيانات في قاعدة البيانات
      await saveProfileMutation.mutateAsync({
        name,
        age: parseInt(age),
        gender: gender as 'male' | 'female' | 'other',
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      });

      // الانتقال إلى صفحة الدردشة
      setTimeout(() => {
        setLocation('/chat');
      }, 500);
    } catch (err) {
      setError('حدث خطأ أثناء حفظ البيانات');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* المحتوى */}
      <div className="relative z-10 w-full max-w-md">
        {/* الشعار */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-4 border border-white/30">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ConnectLive</h1>
          <p className="text-white/80 text-sm">تواصل مع أشخاص جدد من حول العالم</p>
        </div>

        {/* بطاقة النموذج */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleStartChat} className="space-y-4">
            {/* رسالة الخطأ */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-white text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* الاسم */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">اسمك</label>
              <Input
                type="text"
                placeholder="أدخل اسمك"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 rounded-xl"
                required
              />
            </div>

            {/* العمر */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">العمر</label>
              <Input
                type="number"
                placeholder="أدخل عمرك"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 rounded-xl"
                min="18"
                max="100"
                required
              />
            </div>

            {/* الجنس */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">الجنس</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-white/20 border border-white/30 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              >
                <option value="" className="bg-gray-900">اختر الجنس</option>
                <option value="male" className="bg-gray-900">ذكر</option>
                <option value="female" className="bg-gray-900">أنثى</option>
              </select>
            </div>

            {/* زر البدء */}
            <Button
              type="submit"
              disabled={isLoading || saveProfileMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 mt-6"
            >
              {isLoading || saveProfileMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  جاري البحث...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Heart className="w-5 h-5 mr-2" />
                  ابدأ الدردشة الآن
                </span>
              )}
            </Button>
          </form>

          {/* شروط الاستخدام */}
          <p className="text-white/60 text-xs text-center mt-6">
            بالضغط على "ابدأ الدردشة" فإنك توافق على
            <a href="#" className="text-white/80 hover:text-white underline mx-1">شروط الاستخدام</a>
          </p>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm">
            ✨ اتصالات فورية • 🔒 خصوصية تامة • 🌍 مجتمع عالمي
          </p>
        </div>
      </div>
    </div>
  );
}
