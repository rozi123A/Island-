import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, SkipForward, Flag, Volume2, VolumeX } from 'lucide-react';

export default function ChatRoom() {
  const [, setLocation] = useLocation();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    // محاكاة الاتصال
    const timer = setTimeout(() => setIsConnecting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setLocation('/');
  };

  const handleNextPerson = () => {
    setCallDuration(0);
    setIsConnecting(true);
    setTimeout(() => setIsConnecting(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-cyan-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* المحتوى */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* رأس الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">غرفة الدردشة</h1>
          <p className="text-white/70">
            {isConnecting ? '⏳ جاري البحث عن شخص...' : `⏱️ ${formatTime(callDuration)}`}
          </p>
        </div>

        {/* منطقة الفيديو */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* الفيديو الخاص بك */}
          <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl overflow-hidden aspect-video shadow-2xl border-2 border-white/20">
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              {isVideoOn ? (
                <div className="text-center">
                  <Video className="w-16 h-16 text-white/50 mx-auto mb-2" />
                  <p className="text-white/70">كاميرتك</p>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff className="w-16 h-16 text-white/50 mx-auto mb-2" />
                  <p className="text-white/70">الكاميرا مطفأة</p>
                </div>
              )}
            </div>
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm">
              أنت
            </div>
          </div>

          {/* فيديو الشخص الآخر */}
          <div className="relative bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl overflow-hidden aspect-video shadow-2xl border-2 border-white/20">
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              {isConnecting ? (
                <div className="text-center">
                  <div className="animate-spin mb-2">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full"></div>
                  </div>
                  <p className="text-white/70">جاري الاتصال...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Video className="w-16 h-16 text-white/50 mx-auto mb-2" />
                  <p className="text-white/70">الشخص الآخر</p>
                </div>
              )}
            </div>
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm">
              👤 مستخدم
            </div>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {/* زر الميكروفون */}
            <Button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`rounded-full w-14 h-14 flex items-center justify-center transition-all ${
                isMicOn
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
              }`}
              title={isMicOn ? 'إطفاء الميكروفون' : 'تشغيل الميكروفون'}
            >
              {isMicOn ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </Button>

            {/* زر الكاميرا */}
            <Button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`rounded-full w-14 h-14 flex items-center justify-center transition-all ${
                isVideoOn
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
              }`}
              title={isVideoOn ? 'إطفاء الكاميرا' : 'تشغيل الكاميرا'}
            >
              {isVideoOn ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </Button>

            {/* زر مستوى الصوت */}
            <Button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`rounded-full w-14 h-14 flex items-center justify-center transition-all ${
                isSpeakerOn
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
              }`}
              title={isSpeakerOn ? 'كتم الصوت' : 'تشغيل الصوت'}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <VolumeX className="w-6 h-6 text-white" />
              )}
            </Button>

            {/* زر الانتقال للشخص التالي */}
            <Button
              onClick={handleNextPerson}
              disabled={isConnecting}
              className="rounded-full w-14 h-14 flex items-center justify-center bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 transition-all"
              title="الانتقال للشخص التالي"
            >
              <SkipForward className="w-6 h-6 text-white" />
            </Button>

            {/* زر الإبلاغ */}
            <Button
              className="rounded-full w-14 h-14 flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 transition-all"
              title="إبلاغ عن هذا المستخدم"
            >
              <Flag className="w-6 h-6 text-white" />
            </Button>
          </div>

          {/* زر إنهاء الاتصال */}
          <Button
            onClick={handleEndCall}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <PhoneOff className="w-5 h-5 mr-2" />
            إنهاء الاتصال
          </Button>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            💡 تلميح: استخدم الأزرار أعلاه للتحكم في الميكروفون والكاميرا
          </p>
        </div>
      </div>
    </div>
  );
}
