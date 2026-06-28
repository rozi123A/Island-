import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { PhoneOff, Mic, MicOff, Video, VideoOff, SkipForward, Flag, Volume2, VolumeX, Send, MessageSquare, X } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

type Status = 'connecting' | 'waiting' | 'matched' | 'ended';

interface ChatMsg {
  text: string;
  mine: boolean;
  name: string;
  time: string;
}

function getWsUrl(): string {
  const loc = window.location;
  const proto = loc.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${loc.host}/ws`;
}

export default function ChatRoom() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const myName = (user as any)?.name || 'انت';
  const myAvatar = (user as any)?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(myName)}`;
  const myId = (user as any)?.openId || `guest_${Date.now()}`;

  // UI state
  const [status, setStatus] = useState<Status>('connecting');
  const [peerName, setPeerName] = useState('');
  const [peerAvatar, setPeerAvatar] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [peerVideoOff, setPeerVideoOff] = useState(false);
  const [unread, setUnread] = useState(0);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roleRef = useRef<'caller' | 'callee' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── helpers ────────────────────────────────────────────────────────────────
  const wsSend = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const addMessage = useCallback((text: string, mine: boolean, name: string) => {
    const time = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { text, mine, name, time }]);
    if (!mine) setUnread(u => u + 1);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
  }, [stopTimer]);

  const closePeerConnection = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
  }, []);

  // ── getUserMedia ───────────────────────────────────────────────────────────
  const initLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch {
      // camera unavailable — try audio only
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        localStreamRef.current = stream;
        setIsVideoOn(false);
        return stream;
      } catch {
        setIsVideoOn(false);
        return null;
      }
    }
  }, []);

  // ── create peer connection ─────────────────────────────────────────────────
  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection(STUN_SERVERS);
    pcRef.current = pc;

    // Add local tracks
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    // Remote stream → video element
    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
        // detect if remote has video track
        const hasVideo = e.streams[0].getVideoTracks().some(t => t.enabled && t.readyState === 'live');
        setPeerVideoOff(!hasVideo);
      }
    };

    // Send ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) wsSend({ type: 'ice-candidate', data: e.candidate });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setStatus('waiting');
        closePeerConnection();
        wsSend({ type: 'next' });
      }
    };

    return pc;
  }, [wsSend, closePeerConnection]);

  // ── signaling ──────────────────────────────────────────────────────────────
  const handleSignal = useCallback(async (msg: any) => {
    switch (msg.type) {
      case 'waiting':
        setStatus('waiting');
        setPeerName('');
        setPeerAvatar('');
        setMessages([]);
        stopTimer();
        closePeerConnection();
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        break;

      case 'matched': {
        roleRef.current = msg.role;
        setPeerName(msg.peer?.name || 'مستخدم');
        setPeerAvatar(msg.peer?.avatar || '');
        setStatus('matched');
        startTimer();
        const pc = createPC();

        if (msg.role === 'caller') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          wsSend({ type: 'offer', data: offer });
        }
        break;
      }

      case 'offer': {
        const pc = pcRef.current || createPC();
        await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        wsSend({ type: 'answer', data: answer });
        break;
      }

      case 'answer': {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(msg.data));
        break;
      }

      case 'ice-candidate': {
        try {
          await pcRef.current?.addIceCandidate(new RTCIceCandidate(msg.data));
        } catch { /* ignore */ }
        break;
      }

      case 'text-message':
        addMessage(msg.text, false, msg.senderName || 'مستخدم');
        break;

      case 'peer-left':
        setStatus('waiting');
        stopTimer();
        closePeerConnection();
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        wsSend({ type: 'next' });
        break;
    }
  }, [createPC, wsSend, addMessage, startTimer, stopTimer, closePeerConnection]);

  // ── connect WebSocket ──────────────────────────────────────────────────────
  useEffect(() => {
    let ws: WebSocket;
    let destroyed = false;

    const connect = async () => {
      await initLocalMedia();
      if (destroyed) return;

      ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        wsSend({ type: 'join', userId: myId, name: myName, avatar: myAvatar });
      };

      ws.onmessage = (e) => {
        let msg: any;
        try { msg = JSON.parse(e.data); } catch { return; }
        handleSignal(msg);
      };

      ws.onclose = () => {
        if (!destroyed) setStatus('ended');
      };
    };

    connect();

    return () => {
      destroyed = true;
      stopTimer();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      closePeerConnection();
      ws?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // clear unread when chat open
  useEffect(() => {
    if (showChat) setUnread(0);
  }, [showChat]);

  // ── controls ───────────────────────────────────────────────────────────────
  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !isMicOn; });
    setIsMicOn(!isMicOn);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !isVideoOn; });
    setIsVideoOn(!isVideoOn);
  };

  const handleNext = () => {
    setMessages([]);
    stopTimer();
    closePeerConnection();
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    wsSend({ type: 'next' });
  };

  const handleEnd = () => {
    wsRef.current?.close();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    closePeerConnection();
    setLocation('/');
  };

  const sendText = () => {
    const text = inputText.trim();
    if (!text) return;
    wsSend({ type: 'text-message', text });
    addMessage(text, true, myName);
    setInputText('');
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── render ─────────────────────────────────────────────────────────────────
  const statusLabel = status === 'connecting' ? 'جاري الاتصال بالشبكة...'
    : status === 'waiting' ? 'جاري البحث عن شخص...'
    : status === 'matched' ? formatTime(callDuration)
    : 'انتهت المكالمة';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col p-2 md:p-4 relative overflow-hidden">

      {/* Header */}
      <div className="text-center mb-3">
        <h1 className="text-2xl font-bold text-white">غرفة الدردشة</h1>
        <p className={`text-sm mt-1 ${status === 'matched' ? 'text-green-400' : 'text-yellow-300 animate-pulse'}`}>
          {status === 'matched' ? `متصل بـ ${peerName} — ${statusLabel}` : statusLabel}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 flex-1">

        {/* Videos */}
        <div className="flex flex-col gap-3 flex-1">

          {/* Remote video */}
          <div className="relative bg-gray-800 rounded-2xl overflow-hidden aspect-video shadow-2xl border border-white/10 flex-1">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${status !== 'matched' || peerVideoOff ? 'hidden' : ''}`}
              style={{ transform: 'scaleX(-1)' }}
            />

            {(status !== 'matched' || peerVideoOff) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {status === 'matched' ? (
                  <>
                    {peerAvatar ? (
                      <img src={peerAvatar} alt={peerName} className="w-24 h-24 rounded-full border-4 border-white/30 mb-3 bg-white object-cover" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-3 text-4xl">👤</div>
                    )}
                    <p className="text-white font-semibold text-lg">{peerName}</p>
                    <p className="text-white/50 text-sm mt-1">الكاميرا مطفاة</p>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-white/70">{statusLabel}</p>
                  </div>
                )}
              </div>
            )}

            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">
              {status === 'matched' ? peerName : 'ينتظر...'}
            </div>
          </div>

          {/* Local video (small) */}
          <div className="relative bg-gray-700 rounded-2xl overflow-hidden shadow-xl border border-white/10" style={{ height: '140px' }}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
              style={{ transform: 'scaleX(-1)' }}
            />
            {!isVideoOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <img src={myAvatar} alt={myName} className="w-16 h-16 rounded-full border-2 border-white/40 mb-1 bg-white object-cover" />
                <p className="text-white text-xs">{myName}</p>
              </div>
            )}
            <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-500 px-2 py-0.5 rounded-full text-white text-xs font-bold">
              {myName}
            </div>
          </div>
        </div>

        {/* Chat panel */}
        {showChat && (
          <div className="flex flex-col bg-gray-800/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl w-full md:w-80 h-80 md:h-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white font-semibold text-sm">الدردشة الكتابية</span>
              <button onClick={() => setShowChat(false)} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {messages.length === 0 && (
                <p className="text-white/30 text-xs text-center mt-4">لا توجد رسائل بعد</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'}`}>
                  <span className="text-white/40 text-xs mb-0.5">{m.name} · {m.time}</span>
                  <div className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] break-words ${m.mine ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' : 'bg-white/15 text-white'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendText()}
                placeholder="اكتب رسالة..."
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                dir="rtl"
              />
              <button
                onClick={sendText}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl px-3 hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 bg-black/30 backdrop-blur-md rounded-3xl p-4 border border-white/10">
        <div className="flex flex-wrap gap-3 justify-center mb-3">

          <button onClick={toggleMic}
            className={`rounded-full w-13 h-13 p-3 transition-all ${isMicOn ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
            {isMicOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
          </button>

          <button onClick={toggleVideo}
            className={`rounded-full w-13 h-13 p-3 transition-all ${isVideoOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'}`}>
            {isVideoOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
          </button>

          <button onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`rounded-full w-13 h-13 p-3 transition-all ${isSpeakerOn ? 'bg-purple-500 hover:bg-purple-600' : 'bg-red-500 hover:bg-red-600'}`}>
            {isSpeakerOn ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
          </button>

          <button
            onClick={() => { setShowChat(!showChat); setUnread(0); }}
            className="relative rounded-full p-3 bg-cyan-500 hover:bg-cyan-600 transition-all"
          >
            <MessageSquare className="w-6 h-6 text-white" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>

          <button onClick={handleNext} disabled={status === 'connecting' || status === 'waiting'}
            className="rounded-full p-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-40 transition-all">
            <SkipForward className="w-6 h-6 text-white" />
          </button>

          <button className="rounded-full p-3 bg-rose-500 hover:bg-rose-600 transition-all">
            <Flag className="w-6 h-6 text-white" />
          </button>
        </div>

        <button onClick={handleEnd}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
          <PhoneOff className="w-5 h-5" />
          انهاء الاتصال
        </button>
      </div>
    </div>
  );
}
