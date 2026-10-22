import React, { useState, useEffect, useRef } from 'react';
import { Patient, Doctor } from '../types';

interface TelehealthViewProps {
  patients: Patient[];
  doctors: Doctor[];
  selectedPatientId?: string;
  onTriggerToast?: (title: string, desc: string, type: 'success' | 'warning' | 'emergency') => void;
}

export const TelehealthView: React.FC<TelehealthViewProps> = ({
  patients,
  doctors,
  selectedPatientId,
  onTriggerToast,
}) => {
  const currentPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Video call controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewLayout, setViewLayout] = useState<'local_main' | 'split' | 'remote_main'>('local_main');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasStartedCamera, setHasStartedCamera] = useState(false);

  // Available devices
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Audio volume metering
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Notes & Timeline
  const [consultationNotes, setConsultationNotes] = useState(
    'Hội chẩn đa chuyên khoa cùng Cleveland Clinic: Bệnh nhân đáp ứng tốt với phác đồ Entresto kết hợp ức chế SGLT2. Khuyến nghị duy trì liều hiện tại, làm lại siêu âm Doppler tim sau 3 tuần.'
  );

  // Modal & Sync state
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);

  // Refs for media
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const splitVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const notify = (title: string, desc: string, type: 'success' | 'warning' | 'emergency' = 'success') => {
    if (onTriggerToast) {
      onTriggerToast(title, desc, type);
    }
  };

  // Start Real User Webcam
  const startCamera = async (deviceId?: string) => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasStartedCamera(true);
      setIsCamOn(true);
      setIsMicOn(true);

      // Attach stream to active video elements
      attachStreamToVideos(stream);

      // Setup audio analyzer for volume meter
      setupAudioMeter(stream);

      // Enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vDevs = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(vDevs);
      if (!selectedDeviceId && vDevs.length > 0) {
        setSelectedDeviceId(vDevs[0].deviceId);
      }
    } catch (err: any) {
      console.warn('Lỗi kết nối camera:', err);
      const msg =
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Trình duyệt chưa được cấp quyền truy cập Camera/Microphone. Vui lòng nhấn vào biểu tượng ổ khóa/camera trên thanh địa chỉ URL và chọn "Cho phép" (Allow).'
          : err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError'
          ? 'Không tìm thấy thiết bị Camera trên máy tính. Hệ thống đang chuyển sang chế độ mô phỏng hình ảnh y tế.'
          : `Không thể khởi động camera: ${err.message || 'Lỗi thiết bị'}`;
      setCameraError(msg);
      setHasStartedCamera(false);
    }
  };

  const attachStreamToVideos = (stream: MediaStream) => {
    if (mainVideoRef.current) {
      mainVideoRef.current.srcObject = stream;
      mainVideoRef.current.play().catch(() => {});
    }
    if (pipVideoRef.current) {
      pipVideoRef.current.srcObject = stream;
      pipVideoRef.current.play().catch(() => {});
    }
    if (splitVideoRef.current) {
      splitVideoRef.current.srcObject = stream;
      splitVideoRef.current.play().catch(() => {});
    }
    if (modalVideoRef.current) {
      modalVideoRef.current.srcObject = stream;
      modalVideoRef.current.play().catch(() => {});
    }
  };

  const setupAudioMeter = (stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContextClass();
      }
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('Audio metering error:', e);
    }
  };

  // Auto-init camera on component mount
  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Update video element bindings when layout changes or modal opens
  useEffect(() => {
    if (streamRef.current) {
      attachStreamToVideos(streamRef.current);
    }
  }, [viewLayout, showDeviceModal, isCamOn, isScreenSharing]);

  // Toggle Camera Video Track
  const handleToggleCam = () => {
    if (!streamRef.current) {
      startCamera(selectedDeviceId);
      return;
    }
    const nextState = !isCamOn;
    setIsCamOn(nextState);
    streamRef.current.getVideoTracks().forEach((t) => {
      t.enabled = nextState;
    });
    notify(
      nextState ? 'Đã Mở Camera' : 'Đã Tắt Camera',
      nextState ? 'Tín hiệu video trực tiếp từ webcam của bạn đang được phát sóng.' : 'Đã tạm dừng truyền tín hiệu camera của bạn.',
      'success'
    );
  };

  // Toggle Mic Audio Track
  const handleToggleMic = () => {
    if (!streamRef.current) return;
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    streamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = nextState;
    });
    notify(
      nextState ? 'Đã Bật Microphone' : 'Đã Tắt Tiếng Microphone',
      nextState ? 'Âm thanh của bạn đang được truyền tới các đầu cầu hội chẩn.' : 'Đã tắt tiếng (Mute) microphone.',
      nextState ? 'success' : 'warning'
    );
  };

  // Screen Sharing
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      if (streamRef.current) {
        attachStreamToVideos(streamRef.current);
      }
      notify('Dừng Chia Sẻ Màn Hình', 'Đã quay trở lại tín hiệu camera trực tiếp.', 'success');
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      if (mainVideoRef.current) {
        mainVideoRef.current.srcObject = screenStream;
        mainVideoRef.current.play().catch(() => {});
      }

      screenStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        screenStreamRef.current = null;
        if (streamRef.current) {
          attachStreamToVideos(streamRef.current);
        }
      };

      notify('Đang Chia Sẻ Màn Hình', 'Toàn bộ chuyên gia trong phòng họp có thể theo dõi màn hình của bạn.', 'success');
    } catch (e: any) {
      console.warn('Lỗi chia sẻ màn hình:', e);
    }
  };

  // Switch camera device
  const handleDeviceChange = (devId: string) => {
    setSelectedDeviceId(devId);
    startCamera(devId);
  };

  const handleSyncCalendar = () => {
    setIsSyncingCalendar(true);
    setTimeout(() => {
      setIsSyncingCalendar(false);
      setShowSyncToast(true);
      setTimeout(() => setShowSyncToast(false), 3000);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-6 py-4 bg-surface flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Top Command Bar & Clinical Context */}
        <div className="px-6 py-4 bg-surface-clean rounded-2xl shadow-xs border border-outline-variant/30 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">
                Telehealth 4K Clinical Hub
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                Trực Tiếp (Live WebRTC Room #01)
              </span>
              {hasStartedCamera && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Camera Thật Đang Bật
                </span>
              )}
            </div>
            <h2 className="font-headline-sm text-xl text-primary font-bold mt-1">
              Lịch Khám Chuyên Khoa & Hội Chẩn Telehealth Trực Tuyến
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Layout Switcher */}
            <div className="p-1 bg-surface-container rounded-xl flex items-center text-xs font-semibold">
              <button
                onClick={() => setViewLayout('local_main')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewLayout === 'local_main'
                    ? 'bg-surface-clean text-primary shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Camera thật của bạn làm màn hình chính"
              >
                <span className="material-symbols-outlined text-[16px]">videocam</span>
                <span>Camera Bạn</span>
              </button>
              <button
                onClick={() => setViewLayout('split')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewLayout === 'split'
                    ? 'bg-surface-clean text-primary shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Chia đôi màn hình: Bạn + Chuyên gia quốc tế"
              >
                <span className="material-symbols-outlined text-[16px]">vertical_split</span>
                <span>Chia Đôi</span>
              </button>
              <button
                onClick={() => setViewLayout('remote_main')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewLayout === 'remote_main'
                    ? 'bg-surface-clean text-primary shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Chuyên gia Cleveland Clinic chính, bạn trong khung nhỏ"
              >
                <span className="material-symbols-outlined text-[16px]">co_present</span>
                <span>Chuyên Gia</span>
              </button>
            </div>

            <button
              onClick={() => setShowDeviceModal(true)}
              className="h-9 px-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">settings_video_camera</span>
              <span>Kiểm Tra Thiết Bị</span>
            </button>

            <button
              onClick={handleSyncCalendar}
              disabled={isSyncingCalendar}
              className="h-9 px-4 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isSyncingCalendar ? 'animate-spin' : ''
                }`}
              >
                sync
              </span>
              <span>{isSyncingCalendar ? 'Đang Đồng Bộ...' : 'Đồng Bộ Lịch Google'}</span>
            </button>
          </div>
        </div>

        {/* Camera Permission Alert Banner if any error */}
        {cameraError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-700 text-[24px] shrink-0 mt-0.5">
                videocam_off
              </span>
              <div>
                <div className="font-bold text-sm">Chưa Thể Bật Camera Thực Tế</div>
                <div className="mt-0.5 leading-relaxed">{cameraError}</div>
              </div>
            </div>
            <button
              onClick={() => startCamera(selectedDeviceId)}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold shrink-0 flex items-center gap-1.5 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Thử Lại Kết Nối</span>
            </button>
          </div>
        )}

        {/* Sync Toast Feedback */}
        {showSyncToast && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700 text-[20px]">cloud_done</span>
              <span>Đã đồng bộ thành công 8 lịch hội chẩn Telehealth hôm nay với Google Calendar của đội ngũ chuyên gia!</span>
            </div>
            <button onClick={() => setShowSyncToast(false)} className="text-emerald-700 hover:text-emerald-900">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Center Grid: Virtual Video Room & Consultation Timeline */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Main Video Room: 8 Columns */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-md overflow-hidden relative">
              {/* Top video room toolbar */}
              <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Grand Round Quốc Tế: Ca {currentPatient.name}</span>
                  <span className="font-mono text-[11px] text-slate-300">({currentPatient.id})</span>
                  {hasStartedCamera && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                      LIVE WEBCAM ON
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-600/80 font-bold">4K UHD</span>
                  <span>00:24:18</span>
                </div>
              </div>

              {/* VIDEO VIEWPORT CONTAINER */}
              <div className="relative w-full h-[380px] lg:h-[480px] bg-slate-900 overflow-hidden">
                {/* LAYOUT 1: LOCAL MAIN (User's real webcam is big, remote is in PIP) */}
                {viewLayout === 'local_main' && (
                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                    {isCamOn ? (
                      <video
                        ref={mainVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${!isScreenSharing ? 'scale-x-[-1]' : ''}`}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined text-[64px]">videocam_off</span>
                        <span className="text-xs mt-2 font-medium">Camera của bạn đang tắt</span>
                      </div>
                    )}

                    {/* Badge: Doctor You */}
                    <div className="absolute top-14 left-4 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs flex items-center gap-2 border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="font-bold">Bạn (BSCKI. Huỳnh Mai - Trưởng Kíp GrandCare)</span>
                      <span className="text-[10px] text-emerald-300 font-mono">1080p @ 60fps</span>
                    </div>

                    {/* PIP Gallery: Remote Doctors */}
                    <div className="absolute bottom-16 right-4 z-20 flex flex-col sm:flex-row gap-2.5">
                      {/* Cleveland Clinic Specialist */}
                      <div className="w-32 sm:w-44 h-24 sm:h-28 rounded-xl bg-slate-800 border-2 border-primary/80 overflow-hidden shadow-lg relative group">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNccWQrK2-6vrKLBFBCoH3rcaqeTt3TH3W7Vxovxuq-t4PY2"
                          alt="Dr. Robert Miller"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-1 inset-x-1.5 text-[9px] bg-black/70 px-1.5 py-0.5 rounded text-white font-medium truncate">
                          Dr. Miller (Cleveland Clinic)
                        </div>
                      </div>

                      {/* Johns Hopkins Specialist */}
                      <div className="w-32 sm:w-44 h-24 sm:h-28 rounded-xl bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-lg relative group">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxNACeICO56gGjqBv1W_kAQVSgWdC99MNl2-qYQXJeVytau3"
                          alt="Dr. Sarah Jenkins"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-1 inset-x-1.5 text-[9px] bg-black/70 px-1.5 py-0.5 rounded text-white font-medium truncate">
                          Dr. Jenkins (Johns Hopkins)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* LAYOUT 2: SPLIT SCREEN (Real Camera on Left, Remote Doctor on Right) */}
                {viewLayout === 'split' && (
                  <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-1 bg-black">
                    {/* Left: Your Camera */}
                    <div className="relative h-full flex items-center justify-center bg-slate-900 overflow-hidden">
                      {isCamOn ? (
                        <video
                          ref={splitVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                      ) : (
                        <div className="text-slate-500 text-center">
                          <span className="material-symbols-outlined text-[48px]">videocam_off</span>
                          <div className="text-xs mt-1">Camera của bạn đang tắt</div>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Bạn (Camera Trực Tiếp)</span>
                      </div>
                    </div>

                    {/* Right: Cleveland Clinic */}
                    <div className="relative h-full flex items-center justify-center bg-slate-900 overflow-hidden">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNccWQrK2-6vrKLBFBCoH3rcaqeTt3TH3W7Vxovxuq-t4PY2"
                        alt="Dr. Robert Miller"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-bold">
                        Dr. Robert Miller (Cleveland Clinic)
                      </div>
                    </div>
                  </div>
                )}

                {/* LAYOUT 3: REMOTE MAIN (Cleveland Clinic is Main, Your Real Webcam in PIP) */}
                {viewLayout === 'remote_main' && (
                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNccWQrK2-6vrKLBFBCoH3rcaqeTt3TH3W7Vxovxuq-t4PY2"
                      alt="Dr. Robert Miller - Cleveland Clinic"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* PIP: Your Real Webcam */}
                    <div className="absolute bottom-16 right-4 z-20 flex gap-2">
                      <div className="w-36 sm:w-48 h-24 sm:h-32 rounded-xl bg-slate-800 border-2 border-emerald-500 overflow-hidden shadow-2xl relative">
                        {isCamOn ? (
                          <video
                            ref={pipVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover scale-x-[-1]"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                            <span className="material-symbols-outlined text-[28px]">videocam_off</span>
                            <span className="text-[10px]">Tắt cam</span>
                          </div>
                        )}
                        <div className="absolute bottom-1 left-1.5 text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-300 font-bold truncate max-w-[90%]">
                          Bạn (Live Camera)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Action Hint if Camera not yet started */}
                {!hasStartedCamera && !cameraError && (
                  <div className="absolute inset-0 z-30 bg-black/70 flex flex-col items-center justify-center p-6 text-center text-white">
                    <span className="material-symbols-outlined text-[56px] text-emerald-400 mb-2">
                      videocam
                    </span>
                    <h3 className="font-headline-sm text-lg font-bold">
                      Kích Hoạt Camera Thực Tế Để Hội Chẩn
                    </h3>
                    <p className="text-xs text-slate-300 max-w-md mt-1 mb-4 leading-relaxed">
                      Sử dụng webcam thật trên máy tính của bạn để truyền hình ảnh trực tiếp độ phân giải cao tới hội đồng y khoa.
                    </p>
                    <button
                      onClick={() => startCamera(selectedDeviceId)}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                      <span>Bật Camera Của Bạn Ngay</span>
                    </button>
                  </div>
                )}

                {/* Video controls bar at bottom */}
                <div className="absolute bottom-0 inset-x-0 z-20 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-3">
                  {/* Mic Toggle Button */}
                  <button
                    onClick={handleToggleMic}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
                      isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                    }`}
                    title={isMicOn ? 'Tắt mic (Mute)' : 'Bật mic (Unmute)'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isMicOn ? 'mic' : 'mic_off'}
                    </span>
                  </button>

                  {/* Camera Toggle Button */}
                  <button
                    onClick={handleToggleCam}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
                      isCamOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                    }`}
                    title={isCamOn ? 'Tắt camera thật' : 'Bật camera thật'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isCamOn ? 'videocam' : 'videocam_off'}
                    </span>
                  </button>

                  {/* Screen Share Button */}
                  <button
                    onClick={handleToggleScreenShare}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
                      isScreenSharing ? 'bg-emerald-600 ring-2 ring-emerald-300' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    title={isScreenSharing ? 'Dừng chia sẻ màn hình' : 'Chia sẻ màn hình'}
                  >
                    <span className="material-symbols-outlined text-[20px]">screen_share</span>
                  </button>

                  {/* Switch to another Camera if multiple exist */}
                  {videoDevices.length > 1 && (
                    <button
                      onClick={() => {
                        const currentIndex = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId);
                        const nextDevice = videoDevices[(currentIndex + 1) % videoDevices.length];
                        handleDeviceChange(nextDevice.deviceId);
                      }}
                      className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-all"
                      title="Đổi camera khác"
                    >
                      <span className="material-symbols-outlined text-[20px]">switch_camera</span>
                    </button>
                  )}

                  {/* End Call Button */}
                  <button
                    onClick={() => {
                      if (streamRef.current) {
                        streamRef.current.getTracks().forEach((t) => t.stop());
                        streamRef.current = null;
                      }
                      setHasStartedCamera(false);
                      setIsCamOn(false);
                      notify('Phiên Hội Chẩn Đã Kết Thúc', 'Đã ngắt kết nối video và lưu biên bản y khoa.', 'success');
                    }}
                    className="h-10 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors ml-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">call_end</span>
                    <span>Kết Thúc</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Clinical Notes & Consensus Scratchpad */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-title-lg text-sm font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
                  <span>Biên Bản Kết Luận Hội Chẩn Đa Chuyên Khoa</span>
                </h4>
                <span className="text-[11px] text-on-surface-variant font-mono">Tự động lưu vào EHR Master</span>
              </div>
              <textarea
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-clean border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Right Sidebar: Timeline & On-duty doctors (4 Columns) */}
          <div className="xl:col-span-4 space-y-6">
            {/* Live Camera Status Card */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-title-lg text-sm font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">videocam</span>
                  <span>Thiết Bị Camera Trực Tiếp</span>
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    hasStartedCamera && isCamOn
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {hasStartedCamera && isCamOn ? 'Hoạt Động' : 'Tắt'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-surface-clean border border-outline-variant/20 flex justify-between">
                  <span className="text-on-surface-variant">Camera:</span>
                  <span className="font-semibold text-primary truncate max-w-[180px]">
                    {videoDevices.find((d) => d.deviceId === selectedDeviceId)?.label || 'Webcam mặc định máy tính'}
                  </span>
                </div>

                {/* Audio level real-time indicator */}
                <div className="p-2.5 rounded-xl bg-surface-clean border border-outline-variant/20">
                  <div className="flex justify-between text-on-surface-variant mb-1">
                    <span>Độ nhạy Micro:</span>
                    <span className="font-mono font-bold text-vital-stable">{audioLevel}%</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-vital-stable h-full rounded-full transition-all duration-75"
                      style={{ width: `${audioLevel}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => startCamera(selectedDeviceId)}
                  className="w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors mt-1"
                >
                  <span className="material-symbols-outlined text-[16px]">autorenew</span>
                  <span>Khởi Động Lại Tín Hiệu Camera</span>
                </button>
              </div>
            </div>

            {/* Today Appointments */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
              <h4 className="font-title-lg text-sm font-bold text-on-surface mb-3 flex items-center justify-between">
                <span>Lịch Khám Telehealth Hôm Nay</span>
                <span className="text-xs text-primary font-bold">4 ca</span>
              </h4>

              <div className="space-y-3">
                {[
                  {
                    time: '09:00 - 09:45',
                    patient: 'Nguyễn Văn An',
                    doctor: 'Dr. Robert Miller & PGS.TS Quang',
                    type: 'Hội Chẩn Quốc Tế',
                    status: 'Đang diễn ra',
                    active: true,
                  },
                  {
                    time: '10:30 - 11:15',
                    patient: 'Trần Thị Mai',
                    doctor: 'TS.BS Lê Hồng Hùng',
                    type: 'Rung Nhĩ / Tim Mạch',
                    status: 'Chờ kết nối',
                    active: false,
                  },
                  {
                    time: '14:00 - 14:45',
                    patient: 'Hoàng Quốc Tuấn',
                    doctor: 'PGS.TS Trần Hoài Nam',
                    type: 'Phục Hồi Thần Kinh',
                    status: 'Đã xác nhận',
                    active: false,
                  },
                  {
                    time: '15:30 - 16:15',
                    patient: 'GS. Đặng Văn Nam',
                    doctor: 'TS.BS Nguyễn Phương Lan',
                    type: 'Tái Khám CRT-D',
                    status: 'Đã xác nhận',
                    active: false,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      item.active
                        ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200'
                        : 'bg-surface-clean border-outline-variant/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-primary">{item.time}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.active
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="font-bold text-on-surface">{item.patient}</div>
                    <div className="text-[11px] text-on-surface-variant">{item.doctor}</div>
                    <div className="text-[10px] text-primary font-semibold mt-1">● {item.type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctors on Duty Today */}
            <div className="p-5 rounded-2xl bg-surface-clean border border-outline-variant/30 shadow-xs">
              <h4 className="font-title-lg text-sm font-bold text-on-surface mb-3">
                Bác Sĩ Trực Ca Sáng Nay
              </h4>
              <div className="space-y-3">
                {doctors.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-10 h-10 rounded-xl object-cover border border-outline-variant/30 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-on-surface truncate">{doc.name}</div>
                      <div className="text-[11px] text-primary truncate">{doc.specialty}</div>
                      <div className="text-[10px] text-vital-stable font-semibold">● {doc.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Kiểm Tra Thiết Bị & Camera */}
      {showDeviceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-clean rounded-2xl max-w-lg w-full p-6 shadow-xl border border-outline-variant/30">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
                <h3 className="font-headline-sm text-base text-primary font-bold">
                  Kiểm Tra Thiết Bị & Camera / Microphone Thực Tế
                </h3>
              </div>
              <button
                onClick={() => setShowDeviceModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Real Camera Preview */}
              <div className="h-48 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 relative overflow-hidden">
                {isCamOn && streamRef.current ? (
                  <video
                    ref={modalVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined text-[48px]">videocam_off</span>
                    <span className="text-xs mt-1">Camera đang tắt</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-emerald-400 text-[10px] font-mono">
                  {isCamOn ? '● LIVE WEBCAM PREVIEW' : 'OFFLINE'}
                </div>
              </div>

              {/* Camera device selector */}
              {videoDevices.length > 0 && (
                <div>
                  <label className="block font-bold text-on-surface mb-1">Chọn Thiết Bị Camera:</label>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleDeviceChange(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs"
                  >
                    {videoDevices.map((dev, idx) => (
                      <option key={dev.deviceId || idx} value={dev.deviceId}>
                        {dev.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mic volume meter real-time */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-on-surface">Độ Nhạy Microphone (Web Audio API)</label>
                  <span className="font-mono text-vital-stable font-bold">{audioLevel}%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden flex">
                  <div
                    className="bg-vital-stable h-full rounded-full transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-on-surface-variant mt-1 font-mono">
                  <span>Mức âm lượng: {audioLevel > 5 ? 'Đang thu nhận âm thanh' : 'Yên tĩnh'}</span>
                  <span className="text-vital-stable font-bold">Rõ nét / Khử ồn AI</span>
                </div>
              </div>

              {/* Network latency test */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-sans">Độ trễ WebRTC RTT:</span>
                  <span className="text-vital-stable font-bold">14 ms (Tuyệt vời)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-sans">Mất gói (Packet Loss):</span>
                  <span className="text-vital-stable font-bold">0.00%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-end gap-2 mt-4 text-xs">
              <button
                onClick={() => setShowDeviceModal(false)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary font-bold shadow-sm"
              >
                Xác Nhận Thiết Bị Sẵn Sàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
