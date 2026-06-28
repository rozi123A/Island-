import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { PhoneOff, Mic, MicOff, Video, VideoOff, SkipForward, Flag, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

export default function ChatRoom() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsConnecting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => setLocation('/');
  const handleNextPerson = () => {
    setCallDuration(0);
    setIsConnecting(true);
    setTimeout(() => setIsConnecting(false), 2000);
  };

  const myName = (user as any)?.name || 'انت';
  const myAvatar = (user as any)?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(myName)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-cyan-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">غرفة الدردشة</h1>
          <p className="text-white/70">
            {isConnecting ? 'جاري البحث عن شخص...' : `${formatTime(callDuration)}`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* فيديو المستخدم الحالي */}
          <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl overflow-hidden aspect-video shadow-2xl border-2 border-white/20">
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              {isVideoOn ? (
                <div className="text-center">
                  <img
                    src={myAvatar}
                    alt={myName}
                    className="w-20 h-20 rounded-full mx-auto mb-2 border-4 border-white/50 object-cover bg-white"
                  />
                  <p className="text-white font-semibold text-sm">{myName}</p>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff className="w-16 h-16 text-white/50 mx-auto mb-2" />
                  <p className="text-white/70">الكاميرا مطفاة</p>
                </div>
              )}
            </div>
            <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-1 rounded-full text-white text-xs font-bold shadow">
              {myName}
            </div>
          </div>

          {/* فيديو الشخص الآخر */}
          <div className="relative bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl overflow-hidden aspect-video shadow-2xl border-2 border-white/20">
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              {isConnecting ? (
                <div className="text-center">
                  <div className="animate-spin mb-3">
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
            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">
              غريب
            </div>
          </div>
        </div>

        {/* ازرار التحكم */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 shadow-2xl">
          <div className="flex flex-wrap gap-4 justify-center mb-5">
            <Button onClick={() => setIsMicOn(!isMicOn)}
              className={`rounded-full w-14 h-14 flex items-center justify-center ${isMicOn ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}>
              {isMicOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
            </Button>
            <Button onClick={() => setIsVideoOn(!isVideoOn)}
              className={`rounded-full w-14 h-14 flex items-center justify-center ${isVideoOn ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}>
              {isVideoOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
            </Button>
            <Button onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`rounded-full w-14 h-14 flex items-center justify-center ${isSpeakerOn ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}>
              {isSpeakerOn ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
            </Button>
            <Button onClick={handleNextPerson} disabled={isConnecting}
              className="rounded-full w-14 h-14 flex items-center justify-center bg-gradient-to-r from-yellow-500 to-orange-500 disabled:opacity-50">
              <SkipForward className="w-6 h-6 text-white" />
            </Button>
            <Button className="rounded-full w-14 h-14 flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-500">
              <Flag className="w-6 h-6 text-white" />
            </Button>
          </div>
          <Button onClick={handleEndCall}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-xl">
            <PhoneOff className="w-5 h-5 mr-2" />
            انهاء الاتصال
          </Button>
        </div>
      </div>
    </div>
  );
}
