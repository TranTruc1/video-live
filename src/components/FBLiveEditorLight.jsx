import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Play, Pause, Upload, Trash2, 
  Image as ImageIcon, Clock, Eye,
  Maximize2, Minimize2, Settings, Plus, X,
  Menu, Save, CheckCircle, FileSpreadsheet, Download, Monitor,
  Loader2, Layers, Grid, Check // Thêm icon Grid và Check
} from 'lucide-react';

export default function FBLiveEditor() {
  // --- STATE: UI & Video ---
  const [videoSrc, setVideoSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // --- STATE: Gallery (Thư viện ảnh) ---
  const [gallery, setGallery] = useState([]); // Danh sách ảnh trong thư viện
  const [showGallery, setShowGallery] = useState(false); // Hiển thị modal thư viện
  const [galleryTarget, setGalleryTarget] = useState(null); // Mục tiêu đang chọn ảnh: { type: 'new' | 'edit', id: ... }

  // --- STATE: Livestream Config ---
  const [description, setDescription] = useState(" ");
  const [resolution, setResolution] = useState('720p'); 
  const [isTransparentMode, setIsTransparentMode] = useState(false);

  const RESOLUTIONS = {
    '720p':  { width: 720,  height: 1280, scale: 2, label: 'HD (720x1280)', bitrate: 5000000 },
    '1080p': { width: 1080, height: 1920, scale: 3, label: 'Full HD (1080x1920)', bitrate: 8000000 },
    '2k':    { width: 1440, height: 2560, scale: 4, label: '2K (1440x2560)', bitrate: 12000000 },
    '4k':    { width: 2160, height: 3840, scale: 6, label: '4K (2160x3840)', bitrate: 20000000 },
  };

  // Cấu hình Mắt xem
  const [viewerConfig, setViewerConfig] = useState({
    current: 1542,
    initial: 1542,
    minStep: 1,
    maxStep: 5,
    interval: 1.0,
    isAuto: true
  });

  // Kịch bản Comment
  const [scriptedComments, setScriptedComments] = useState([
    { id: 1, time: 2, name: "Nguyễn Văn A", text: "Hàng đẹp quá shop ơi!", avatar: null, imgObj: null },
    { id: 2, time: 4, name: "Trần Thị B", text: "Xin giá bộ này ạ", avatar: null, imgObj: null },
    { id: 3, time: 7, name: "Lê C", text: "Ship Hà Nội bao lâu?", avatar: null, imgObj: null },
    { id: 4, time: 9, name: "Khách Vip", text: "Bình luận này rất dài để test tính năng tự động xuống dòng khi text quá dài xem có bị tràn ra ngoài không nhé ad.", avatar: null, imgObj: null },
  ]);

  // Form thêm Comment
  const [newCmdName, setNewCmdName] = useState("");
  const [newCmdText, setNewCmdText] = useState("");
  const [newCmdTime, setNewCmdTime] = useState(1);
  const [newCmdAvatar, setNewCmdAvatar] = useState(null);

  // Processing / Export State
  const [isProcessing, setIsProcessing] = useState(false); 
  const [progress, setProgress] = useState(0); 
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Refs for Rendering
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  
  // Animation State Refs
  const activeComments = useRef([]);

  // --- HELPER: Load XLSX Library ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if(document.body.contains(script)) {
        document.body.removeChild(script);
      }
    }
  }, []);

  // --- HELPER: Format Viewer Count ---
  const formatViewerCount = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  // --- HELPER: Word Wrap for Canvas ---
  const getLines = (ctx, text, maxWidth) => {
      const words = text.split(" ");
      let lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
          let word = words[i];
          let width = ctx.measureText(currentLine + " " + word).width;
          if (width < maxWidth) {
              currentLine += " " + word;
          } else {
              lines.push(currentLine);
              currentLine = word;
          }
      }
      lines.push(currentLine);
      return lines;
  };

  // --- LOGIC: Viewer Simulation Loop ---
  useEffect(() => {
    let intervalId;
    if (viewerConfig.isAuto && (isPlaying || isProcessing)) {
      intervalId = setInterval(() => {
        setViewerConfig(prev => {
          const step = Math.floor(Math.random() * (Number(prev.maxStep) - Number(prev.minStep) + 1)) + Number(prev.minStep);
          return { ...prev, current: prev.current + step };
        });
      }, viewerConfig.interval * 1000);
    }
    return () => clearInterval(intervalId);
  }, [viewerConfig.isAuto, viewerConfig.minStep, viewerConfig.maxStep, viewerConfig.interval, isPlaying, isProcessing]);

  // --- LOGIC: Canvas Render Loop ---
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const currentRes = RESOLUTIONS[resolution];
    const scale = currentRes.scale;

    const ctx = canvas.getContext('2d');
    
    // 1. Xử lý Nền (Background)
    if (isTransparentMode) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
        if (video.readyState >= 2) {
            const vRatio = video.videoWidth / video.videoHeight;
            const cRatio = canvas.width / canvas.height;
            let drawW, drawH, startX, startY;

            if (vRatio > cRatio) { 
                drawH = canvas.height;
                drawW = drawH * vRatio;
                startX = -(drawW - canvas.width) / 2;
                startY = 0;
            } else { 
                drawW = canvas.width;
                drawH = drawW / vRatio;
                startX = 0;
                startY = -(drawH - canvas.height) / 2;
            }
            ctx.drawImage(video, startX, startY, drawW, drawH);
        } else {
            ctx.fillStyle = '#f0f2f5'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#8c8c8c';
            ctx.font = `${16 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
            ctx.textAlign = 'center';
            ctx.fillText("Đang chờ video...", canvas.width/2, canvas.height/2);
        }
    }

    // --- BẮT ĐẦU VẼ UI (SCALE UP) ---
    ctx.save(); 
    ctx.scale(scale, scale); 

    // --- 2. VẼ HEADER (LIVE & VIEWERS) ---
    const headerY = 20;
    const liveX = 20;
    
    // A. Ô LIVE
    const liveW = 63;
    const liveH = 33;
    
    ctx.fillStyle = '#E02424'; 
    ctx.beginPath();
    ctx.roundRect(liveX, headerY, liveW, liveH, 6); 
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; 
    ctx.fillText("LIVE", liveX + (liveW/2), headerY + (liveH/2) + 1); 

    // B. Ô Mắt Xem
    const viewerText = `👁 ${formatViewerCount(viewerConfig.current)}`;
    ctx.font = 'bold 18px sans-serif';
    const viewerWidth = ctx.measureText(viewerText).width + 24; 
    const viewerX = liveX + liveW + 10; 
    const viewerH = 33; 

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; 
    ctx.beginPath();
    ctx.roundRect(viewerX, headerY, viewerWidth, viewerH, 6);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(viewerText, viewerX + (viewerWidth / 2), headerY + (viewerH / 2) + 1);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Description
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.fillText(description, 20, headerY + 60);
    ctx.shadowBlur = 0;

    // 3. Logic & Vẽ Comments
    const time = video.currentTime;
    
    if (isProcessing && video.duration > 0) {
        const pct = Math.min(100, (time / video.duration) * 100);
        setProgress(pct);
    }

    const newComments = scriptedComments.filter(
        c => c.time <= time && c.time > time - 0.1 && !activeComments.current.find(ac => ac.id === c.id)
    );
    
    if (newComments.length > 0) {
        newComments.forEach(c => activeComments.current.push({ ...c, addedAt: Date.now() }));
    }

    // --- RENDER COMMENTS TỪ DƯỚI LÊN ---
    const baseHeight = currentRes.height / scale; 
    let currentY = baseHeight - 52; 
    const gap = 6; 
    
    const viewPortHeight = baseHeight * 0.4;
    const topLimitY = currentY - viewPortHeight; 

    activeComments.current = activeComments.current.filter((_, i, arr) => i >= arr.length - 15);

    [...activeComments.current].reverse().forEach((comment, i) => {
        ctx.font = '13px sans-serif';
        const maxWidth = 236;
        const lines = getLines(ctx, comment.text, maxWidth);
        const lineHeight = 16;
        const textBlockHeight = lines.length * lineHeight;
        
        const bubbleH = Math.max(42, 28 + textBlockHeight + 10);
        const bubbleY = currentY - bubbleH;
        
        currentY = bubbleY - gap;

        if (bubbleY + bubbleH < topLimitY) return;

        let alpha = 1;
        const fadeZone = 60; 
        const distFromTop = bubbleY - topLimitY;

        if (distFromTop < fadeZone) {
            alpha = Math.max(0, distFromTop / fadeZone);
        }
        alpha = Math.pow(alpha, 1.5);

        if (alpha <= 0.01) return;

        ctx.globalAlpha = alpha;
        
        // Bubble Background
        const bubbleX = 55;
        const bubbleW = 260;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; 
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 14);
        ctx.fill();

        // Avatar
        const avtX = 30;
        const avtY = bubbleY + 5; 
        const avtR = 18;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avtX, avtY + 10, avtR, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        if (comment.imgObj && comment.imgObj.complete) {
            ctx.drawImage(comment.imgObj, avtX - avtR, avtY + 10 - avtR, avtR * 2, avtR * 2);
        } else {
            ctx.fillStyle = '#1890ff';
            ctx.fillRect(avtX - avtR, avtY + 10 - avtR, avtR * 2, avtR * 2);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(comment.name.charAt(0).toUpperCase(), avtX, avtY + 15);
        }
        ctx.restore();

        // Tên
        ctx.textAlign = 'left';
        ctx.fillStyle = '#bfbfbf'; 
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(comment.name, bubbleX + 12, bubbleY + 18);

        // Text
        ctx.fillStyle = 'white'; 
        ctx.font = '13px sans-serif';
        lines.forEach((line, index) => {
            ctx.fillText(line, bubbleX + 12, bubbleY + 34 + (index * lineHeight));
        });

        ctx.globalAlpha = 1;
    });
    
    // Footer Input
    const inputW = (currentRes.width / scale) * 0.9;
    const inputX = ((currentRes.width / scale) - inputW) / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; 
    ctx.beginPath();
    ctx.roundRect(inputX, baseHeight - 45, inputW, 32, 16);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("Viết bình luận...", inputX + 15, baseHeight - 24);

    ctx.restore(); 
    requestRef.current = requestAnimationFrame(renderCanvas);
  };

  // --- EFFECT: Loop ---
  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderCanvas);
    return () => cancelAnimationFrame(requestRef.current);
  }, [viewerConfig.current, description, scriptedComments, resolution, isProcessing, isPlaying, isTransparentMode]); 

  // --- HANDLERS: Gallery & Images ---
  const handleBulkImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = files.map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file)
    }));

    setGallery(prev => [...prev, ...newImages]);
  };

  const openGallery = (type, id = null) => {
      setGalleryTarget({ type, id });
      setShowGallery(true);
  };

  const selectImageFromGallery = (imgUrl) => {
      if (!galleryTarget) return;

      const img = new Image();
      img.src = imgUrl;

      if (galleryTarget.type === 'new') {
          setNewCmdAvatar(imgUrl);
      } else if (galleryTarget.type === 'edit') {
          setScriptedComments(prev => 
            prev.map(c => c.id === galleryTarget.id ? { ...c, avatar: imgUrl, imgObj: img } : c)
          );
      }
      setShowGallery(false);
  };

  // --- HANDLERS: Others ---
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoSrc(URL.createObjectURL(file));
      activeComments.current = [];
    }
  };

  const updateCommentTime = (id, newTime) => {
    setScriptedComments(prev => 
      prev.map(c => c.id === id ? { ...c, time: parseFloat(newTime) } : c)
          .sort((a, b) => a.time - b.time)
    );
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (typeof window.XLSX === 'undefined') {
        alert("Đang tải thư viện Excel, vui lòng thử lại sau 2 giây!");
        return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        let startRow = 0;
        if (data.length > 0 && typeof data[0][0] === 'string' && isNaN(data[0][0])) {
            startRow = 1;
        }

        const newComments = [];
        for (let i = startRow; i < data.length; i++) {
            const row = data[i];
            if (row.length >= 3) {
                const time = parseFloat(row[0]) || 0;
                const name = String(row[1] || "Khách");
                const text = String(row[2] || ".");
                
                if (text.trim()) {
                    newComments.push({
                        id: Date.now() + i,
                        time: time,
                        name: name,
                        text: text,
                        avatar: null,
                        imgObj: null
                    });
                }
            }
        }

        if (newComments.length > 0) {
            setScriptedComments(prev => [...prev, ...newComments].sort((a, b) => a.time - b.time));
            alert(`Đã thêm thành công ${newComments.length} bình luận từ Excel!`);
        } else {
            alert("Không tìm thấy dữ liệu hợp lệ. Định dạng: Thời gian | Tên | Nội dung");
        }
    };
    reader.readAsBinaryString(file);
  };

  const togglePlay = () => {
    if (isProcessing) return; 
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setIsPlaying(true); } 
    else { video.pause(); setIsPlaying(false); }
  };

  const startExport = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    video.currentTime = 0;
    activeComments.current = [];
    setViewerConfig(prev => ({...prev, current: prev.initial}));

    const canvasStream = canvas.captureStream(60);
    let finalStream = canvasStream;
    try {
        const audioStream = video.captureStream ? video.captureStream() : null;
        if (audioStream && audioStream.getAudioTracks().length > 0) {
            finalStream.addTrack(audioStream.getAudioTracks()[0]);
        }
    } catch (e) {}

    const currentRes = RESOLUTIONS[resolution];
    const options = { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: currentRes.bitrate };
    
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        delete options.mimeType; 
    }

    const recorder = new MediaRecorder(finalStream, options);
    mediaRecorderRef.current = recorder;
    recordedChunksRef.current = [];
    
    recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
    recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none"; a.href = url; 
        const suffix = isTransparentMode ? '_transparent' : '';
        a.download = `fb_live_${resolution}${suffix}_${Date.now()}.webm`;
        document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url);
        
        setIsProcessing(false);
        setProgress(0);
        video.currentTime = 0;
        video.muted = false; 
    };
    
    video.muted = true; 
    video.play(); 
    recorder.start(); 
  };

  const stopProcessing = () => {
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        if (videoRef.current) { 
            videoRef.current.pause(); 
            videoRef.current.muted = false;
        }
        setIsProcessing(false);
    }
  };

  const addScriptComment = () => {
    if (!newCmdName || !newCmdText) return;

    let imgObj = null;
    if (newCmdAvatar) {
        imgObj = new Image();
        imgObj.src = newCmdAvatar;
    }

    setScriptedComments(prev => [...prev, {
        id: Date.now(), time: Number(newCmdTime), name: newCmdName, text: newCmdText, avatar: newCmdAvatar, imgObj: imgObj
    }].sort((a,b) => a.time - b.time));
    setNewCmdName(""); setNewCmdText(""); setNewCmdTime(t => Number(t) + 2); setNewCmdAvatar(null);
  };

  // --- UI COMPONENTS ---
  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-800 font-sans overflow-hidden">
      
      {/* --- CỘT TRÁI --- */}
      <div className={`${isSidebarVisible ? 'w-[380px]' : 'w-0 opacity-0'} transition-all bg-white border-r border-gray-200 flex flex-col z-20 shadow-sm relative`}>
         
         <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-lg font-bold text-[#1890ff] flex items-center gap-2">
                <Video className="w-5 h-5" /> Live Studio
            </h1>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-gray-100 rounded text-gray-600 transition">
                {showSettings ? <CheckCircle size={20} className="text-green-500" /> : <Settings size={20} />}
            </button>
         </div>

         {showSettings ? (
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-5">
                {/* Resolution */}
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Monitor size={16}/> Cài đặt Video</h3>
                    
                    <div className="mb-4">
                        <label className="text-xs text-gray-500 block mb-1">Độ phân giải xuất file</label>
                        <select 
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 bg-white"
                        >
                            {Object.entries(RESOLUTIONS).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Toggle Transparent Mode */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-center gap-2">
                            <Layers size={16} className="text-gray-600"/>
                            <span className="text-sm text-gray-700 font-medium">Chế độ tách nền</span>
                        </div>
                        <button 
                            onClick={() => setIsTransparentMode(!isTransparentMode)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${isTransparentMode ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isTransparentMode ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                        {isTransparentMode ? "Video xuất ra sẽ trong suốt (không có nền)." : "Video xuất ra bao gồm cả nền."}
                    </p>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Eye size={16}/> Cấu hình Mắt xem</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Số lượt ban đầu</label>
                            <input type="number" value={viewerConfig.initial} 
                                onChange={e => setViewerConfig({...viewerConfig, initial: Number(e.target.value), current: Number(e.target.value)})}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label className="text-xs text-gray-500 block mb-1">Tăng tối thiểu</label>
                                <input type="number" value={viewerConfig.minStep} 
                                    onChange={e => setViewerConfig({...viewerConfig, minStep: Number(e.target.value)})}
                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                             </div>
                             <div>
                                <label className="text-xs text-gray-500 block mb-1">Tăng tối đa</label>
                                <input type="number" value={viewerConfig.maxStep} 
                                    onChange={e => setViewerConfig({...viewerConfig, maxStep: Number(e.target.value)})}
                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                             </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Chu kỳ tăng (giây)</label>
                            <input type="number" step="0.1" value={viewerConfig.interval} 
                                onChange={e => setViewerConfig({...viewerConfig, interval: Number(e.target.value)})}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                        </div>
                    </div>
                </div>
            </div>
         ) : (
            <>
                {/* MAIN CONTROL PANEL */}
                <div className="p-4 space-y-4">
                    <div className="bg-white p-3 rounded-lg border border-dashed border-gray-300 text-center hover:border-blue-400 transition">
                        <label className="cursor-pointer block">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-600 font-medium">Chọn Video Live</span>
                            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                        </label>
                        {videoSrc && <div className="text-xs text-green-500 mt-2 flex items-center justify-center gap-1"><CheckCircle size={10}/> Đã chọn</div>}
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Caption Livestream</label>
                        <input value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         {!isProcessing ? (
                            <button 
                                onClick={startExport} 
                                disabled={!videoSrc}
                                className={`flex items-center justify-center gap-2 py-2 rounded text-sm font-bold shadow-sm transition ${videoSrc ? 'bg-[#1890ff] hover:bg-[#40a9ff] text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                <Save className="w-4 h-4" /> Lưu {RESOLUTIONS[resolution].label.split(' ')[0]}
                            </button>
                        ) : (
                            <button onClick={stopProcessing} className="col-span-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm font-bold shadow-sm animate-pulse flex items-center justify-center gap-2">
                                <X size={16} /> Hủy Xử Lý
                            </button>
                        )}
                        
                        {!isProcessing && (
                            <button onClick={togglePlay} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded text-sm font-medium shadow-sm flex items-center justify-center gap-2">
                                {isPlaying ? <Pause size={16}/> : <Play size={16}/>} {isPlaying ? "Tạm dừng" : "Xem thử"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 border-t border-gray-100">
                     <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Kịch bản Comment</span>
                        <div className="flex gap-2">
                            <label className="cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 px-2 py-0.5 rounded text-xs flex items-center gap-1 transition" title="Nhập file Excel (.xlsx, .xls)">
                                <FileSpreadsheet size={12} /> Nhập Excel
                                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
                            </label>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{scriptedComments.length}</span>
                        </div>
                     </div>
                     <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {scriptedComments.map(c => (
                            <div key={c.id} className="bg-white p-2.5 rounded border border-gray-200 shadow-sm flex gap-3 group hover:border-blue-200 transition">
                                <div className="flex flex-col items-center mr-2">
                                     <input 
                                        type="number" 
                                        value={c.time} 
                                        onChange={(e) => updateCommentTime(c.id, e.target.value)}
                                        className="w-16 text-center text-sm border border-gray-300 rounded py-1 bg-white focus:outline-none focus:border-blue-500 font-bold text-blue-600"
                                        step="0.5"
                                        min="0"
                                     />
                                     <span className="text-[9px] text-gray-400 mt-0.5">giây</span>
                                </div>

                                {/* Avatar Trigger - Edit Mode */}
                                <div 
                                    onClick={() => openGallery('edit', c.id)}
                                    className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden mt-1 cursor-pointer relative group"
                                >
                                    {c.avatar ? (
                                        <img src={c.avatar} className="w-full h-full object-cover" alt="avatar" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">{c.name.charAt(0)}</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center transition-all">
                                        <Grid size={12} className="text-white opacity-90" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-gray-800 truncate">{c.name}</div>
                                    <div className="text-xs text-gray-500 break-words">{c.text}</div>
                                </div>
                                <button onClick={()=>setScriptedComments(prev=>prev.filter(x=>x.id!==c.id))} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        ))}
                     </div>
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex gap-2 mb-2">
                        <div className="relative group w-10 h-10 flex-shrink-0">
                            {/* Avatar Trigger - New Comment Mode */}
                            <div 
                                onClick={() => openGallery('new')}
                                className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-400 hover:bg-gray-100 transition"
                            >
                                {newCmdAvatar ? <img src={newCmdAvatar} className="w-full h-full object-cover" alt="preview" /> : <Grid size={16} className="text-gray-400"/>}
                            </div>
                        </div>
                        <input value={newCmdName} onChange={e=>setNewCmdName(e.target.value)} placeholder="Tên khách..." className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
                        <div className="flex items-center bg-white border border-gray-300 rounded px-2 w-24">
                            <Clock size={12} className="text-gray-400 mr-1"/>
                            <input type="number" value={newCmdTime} onChange={e=>setNewCmdTime(e.target.value)} className="w-full outline-none text-sm text-center" />
                        </div>
                    </div>
                    <textarea value={newCmdText} onChange={e=>setNewCmdText(e.target.value)} placeholder="Nội dung bình luận..." rows={2} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm mb-2 focus:outline-none focus:border-blue-500 resize-none" />
                    <button onClick={addScriptComment} className="w-full bg-[#1890ff] hover:bg-[#40a9ff] text-white py-1.5 rounded text-sm font-medium shadow-sm transition">
                        + Thêm vào kịch bản
                    </button>
                </div>
            </>
         )}
      </div>

      {/* --- CỘT PHẢI (CANVAS PREVIEW) --- */}
      <div className={`flex-1 bg-[#f0f2f5] flex items-center justify-center relative overflow-hidden ${isTransparentMode ? 'bg-[url("https://www.transparenttextures.com/patterns/checkerboard.png")]' : ''}`}>
         
         <button onClick={()=>setIsSidebarVisible(!isSidebarVisible)} className="absolute top-4 left-4 z-50 bg-white p-2 rounded-full text-gray-600 shadow-md hover:text-[#1890ff] transition">
             {isSidebarVisible ? <Minimize2 size={20}/> : <Maximize2 size={20}/>}
         </button>

         <div className="relative shadow-2xl rounded-xl overflow-hidden bg-black border-4 border-white">
             <canvas 
                ref={canvasRef} 
                width={RESOLUTIONS[resolution].width} 
                height={RESOLUTIONS[resolution].height} 
                className="block max-h-[85vh] w-auto cursor-pointer"
                onClick={togglePlay}
             />

             <video 
                ref={videoRef} 
                src={videoSrc} 
                className="hidden" 
                crossOrigin="anonymous"
                playsInline
                onEnded={() => {
                    setIsPlaying(false);
                    if(isProcessing) {
                       if(mediaRecorderRef.current) mediaRecorderRef.current.stop();
                       setIsProcessing(false);
                    }
                }}
             />

             {!isPlaying && !isProcessing && videoSrc && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[2px]">
                    <div className="bg-white/90 p-5 rounded-full shadow-lg hover:scale-110 transition duration-300">
                        <Play fill="#1890ff" className="text-[#1890ff] ml-1" size={32} />
                    </div>
                </div>
             )}
             
             {isProcessing && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm text-white">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                            {Math.round(progress)}%
                        </div>
                    </div>
                    <h3 className="text-lg font-bold mt-4 animate-pulse text-blue-400">Đang xử lý video...</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-[200px] text-center">
                        Đang render ở độ phân giải <span className="text-white font-bold">{RESOLUTIONS[resolution].label}</span>.
                    </p>
                    <p className="text-[10px] text-gray-500 mt-2">Vui lòng không đóng tab trình duyệt.</p>
                </div>
             )}
         </div>
      </div>

      {/* --- MODAL: THƯ VIỆN ẢNH --- */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl flex flex-col max-h-[80vh] shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Grid size={20} className="text-[#1890ff]"/> Thư viện Avatar
                    </h3>
                    <button onClick={() => setShowGallery(false)} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <X size={20} className="text-gray-500"/>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {gallery.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <ImageIcon size={48} className="mb-2 opacity-50"/>
                            <p className="text-sm">Chưa có ảnh nào.</p>
                            <p className="text-xs">Tải ảnh lên để bắt đầu.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 gap-3">
                            {gallery.map(img => {
                                // Kiểm tra xem ảnh này đã được dùng ở đâu chưa
                                const isUsed = scriptedComments.some(c => c.avatar === img.url) || newCmdAvatar === img.url;
                                return (
                                    <div 
                                        key={img.id} 
                                        onClick={() => selectImageFromGallery(img.url)}
                                        className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 group transition-all
                                            ${isUsed ? 'border-gray-300 opacity-60' : 'border-transparent hover:border-[#1890ff] shadow-sm'}
                                        `}
                                    >
                                        <img src={img.url} className={`w-full h-full object-cover transition-transform duration-500 ${isUsed ? 'grayscale-[0.5]' : 'group-hover:scale-110'}`} alt="" />
                                        
                                        {/* Icon đánh dấu đã dùng */}
                                        {isUsed && (
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="bg-green-500 text-white p-1 rounded-full shadow-sm">
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-white rounded-b-lg">
                    <label className="flex items-center justify-center gap-2 bg-[#1890ff] hover:bg-[#40a9ff] text-white py-2.5 rounded-lg cursor-pointer font-medium transition shadow-md w-full">
                        <Upload size={18} /> Tải ảnh lên hàng loạt
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleBulkImageUpload} />
                    </label>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}