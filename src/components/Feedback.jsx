import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { 
  Battery, Wifi, Signal, ChevronLeft, Phone, Video, Play, Plus, 
  Image as ImageIcon, Download, Trash2, Camera, PlusCircle, ThumbsUp, Smile, Move, RotateCw, Maximize 
} from 'lucide-react';

/* --- PHẦN CSS ĐÃ FIX: BỎ BO GÓC REVIEW & TỐI ƯU --- */
const styles = `
/* Reset & Base */
:root {
  --bg-color: #f0f2f5;
  --iphone-width: 375px;
  --iphone-height: 812px;
  --msg-blue: #0084FF;
  --msg-grey: #E9E9EB;
}
* { box-sizing: border-box; }
/* Font Arial như yêu cầu */
body { margin: 0; font-family: Arial, sans-serif; background-color: #2c3e50; }

.app-container { display: flex; height: 100vh; overflow: hidden; }

/* LEFT PANEL */
.design-panel { width: 450px; background: white; padding: 20px; overflow-y: auto; border-right: 1px solid #ccc; display: flex; flex-direction: column; gap: 20px; z-index: 2; }
.panel-title { margin-top: 0; color: #333; }
.control-group { border: 1px solid #eee; padding: 15px; border-radius: 8px; background: #fafafa; }
.control-group.highlight { background: #e6f7ff; border-color: #91d5ff; }
.control-group h3 { margin-top: 0; font-size: 16px; margin-bottom: 10px; }
.input-row { display: flex; gap: 10px; margin-bottom: 10px; }
input[type="text"], input[type="time"], textarea, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; font-family: Arial, sans-serif; }
textarea { height: 60px; resize: none; }
.slider-control { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; color: #555; }
.slider-control input[type="range"] { flex: 1; cursor: pointer; }
.action-buttons { display: flex; gap: 10px; margin-top: 10px; }
button { flex: 1; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 5px; font-family: Arial, sans-serif; }
.btn-receiver { background: #e4e6eb; color: black; }
.btn-sender { background: #0084FF; color: white; }
.btn-export { background: #4caf50; color: white; margin-top: 0; flex: 0 0 auto; width: auto; padding: 5px 10px; font-size: 12px;}
.media-controls { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.file-btn { background: #fff; border: 1px solid #ccc; padding: 5px 10px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 13px; }
.preview-thumb img { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; }
.preview-thumb { display: flex; align-items: center; gap: 5px; }
.remove-img { width: 20px; height: 20px; padding: 0; border-radius: 50%; background: red; color: white; font-size: 10px; }
.checkbox-label { display: flex; align-items: center; gap: 5px; font-size: 14px; cursor: pointer; }
.message-list-mini { max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; }
.mini-item { display: flex; justify-content: space-between; padding: 5px 10px; background: white; border-radius: 4px; font-size: 12px; border-left: 3px solid transparent; }
.mini-item.sender { border-left-color: #0084FF; }
.mini-item.receiver { border-left-color: #999; }
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }

/* RIGHT PANEL */
.preview-panel { flex: 1; background: #333; display: flex; justify-content: center; align-items: center; overflow: hidden; position: relative; }

/* --- KHUNG IPHONE ĐÃ ĐƯỢC LÀM PHẲNG (VUÔNG GÓC) --- */
.iphone-frame { 
  width: var(--iphone-width) !important; 
  height: var(--iphone-height) !important; 
  min-width: var(--iphone-width);
  min-height: var(--iphone-height);
  background: white; 
  
  /* ĐÃ BỎ BO GÓC VÀ VIỀN ĐEN DÀY */
  border-radius: 0 !important; 
  border: none !important;
  box-shadow: 0 0 30px rgba(0,0,0,0.3); /* Chỉ giữ bóng mờ cho dễ nhìn trên nền tối */
  
  overflow: hidden; 
  position: relative; 
  flex-shrink: 0; 
}

.iphone-screen { width: 100%; height: 100%; background: white; display: flex; flex-direction: column; position: relative; font-family: Arial, sans-serif; }

/* Status Bar & Header */
.status-bar { height: 44px; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; font-weight: 600; font-size: 15px; z-index: 10; background: white;}
.status-icons { display: flex; gap: 5px; align-items: center; }
.status-icons svg { display: block; } 

.app-header { height: 50px; display: flex; align-items: center; padding: 0 10px; border-bottom: 1px solid #f0f0f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); z-index: 10; background: white; }
.header-user { flex: 1; display: flex; align-items: center; margin-left: 5px; }
.avatar-wrapper { position: relative; width: 36px; height: 36px; margin-right: 10px; }
.avatar-wrapper img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.active-dot { width: 10px; height: 10px; background: #31a24c; border: 2px solid white; border-radius: 50%; position: absolute; bottom: 0; right: 0; }
.user-info { display: flex; flex-direction: column; }
.user-name { font-weight: 700; font-size: 15px; color: #000; font-family: Arial, sans-serif; }
.active-status { font-size: 11px; color: #65676b; }
.header-actions { display: flex; align-items: center; margin-right: 5px; }

/* Chat Area */
.chat-area { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 2px; padding-bottom: 10px; z-index: 5; background: white; }
.message-row { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 2px; }
.message-row.sender { justify-content: flex-end; }
.message-row.receiver { justify-content: flex-start; }
.tiny-avatar { width: 28px; height: 28px; flex-shrink: 0; margin-right: 2px; }
.tiny-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }

/* Bubble Chat */
.bubble { 
  max-width: 70%; 
  padding: 8px 12px;
  font-size: 15px; 
  line-height: 1.4;
  position: relative;
  display: block;
  width: fit-content;
  word-wrap: break-word;       
  word-break: break-word;      
  white-space: pre-wrap;       
  font-family: Arial, sans-serif; 
}

.bubble:not(.is-media) { border-radius: 18px; }
.bubble.receiver { background-color: var(--msg-grey); color: black; }
.bubble.sender { background-color: var(--msg-blue); color: white; }
.bubble.is-media { padding: 0; background: transparent; border-radius: 18px; overflow: hidden; }
.media-content { position: relative; }
.media-content img { display: block; width: 100%; max-width: 200px; border-radius: 18px; border: 1px solid rgba(0,0,0,0.1); }
.play-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: rgba(0,0,0,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); border: 1px solid rgba(255,255,255,0.8); }

/* FOOTER */
.chat-footer { 
  height: 50px; 
  display: flex; 
  align-items: center; 
  padding: 0 10px; 
  gap: 10px; 
  background: white; 
  border-top: 1px solid #f0f0f0;
  z-index: 10;
}
.footer-icons-left { display: flex; gap: 14px; align-items: center; flex-shrink: 0; }
.footer-icons-left svg { display: block; overflow: visible; } 

.chat-input-fake { 
  flex: 1; 
  background: #f0f2f5; 
  height: 34px; 
  border-radius: 18px; 
  display: flex; 
  align-items: center; 
  padding: 0 10px 0 12px; 
  justify-content: space-between;
}
.input-placeholder { color: #aaa; font-size: 16px; font-weight: 400; font-family: Arial, sans-serif; }
.footer-thumb { flex-shrink: 0; display: flex; align-items: center; }

/* WATERMARK */
.watermark-overlay {
  position: absolute;
  top: 50%; left: 50%;
  pointer-events: none; 
  z-index: 99;
  transform-origin: center center;
  white-space: nowrap;
  font-weight: bold;
  font-size: 20px;
  color: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed transparent;
  font-family: Arial, sans-serif;
}
.chat-area::-webkit-scrollbar { width: 4px; }
.chat-area::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }

/* Fix SVG render */
svg { box-sizing: content-box; }
`;

// --- COMPONENT APP ---
const Feedback = () => {
  const [config, setConfig] = useState({
    partnerName: 'Jenny Le',
    currentTime: '09:41',
    avatar: 'https://i.pravatar.cc/150?img=5',
  });

  const [watermark, setWatermark] = useState({
    show: false,
    type: 'text',
    content: 'Shop.com - 0987654321',
    imgUrl: null,
    opacity: 0.7,
    scale: 1,
    rotate: -30,
    x: 0,
    y: 0,
  });

  const [inputMsg, setInputMsg] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'sender', content: 'Hi Jenny ơi, bên kho báo đã giao hàng thành công rồi đó em. Em để ý hòm thư nhận hàng nha', contentType: 'text' },
    { id: 2, type: 'receiver', content: 'Da em vua nhan day ne chi oi. Chi gui le vay hihi', contentType: 'text' },
    { id: 3, type: 'sender', content: 'Hi ok em. Để chị kích hoạt bảo hành cho em nha', contentType: 'text' },
  ]);

  const previewRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) setConfig({ ...config, avatar: URL.createObjectURL(file) });
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };
  const handleWatermarkImage = (e) => {
    const file = e.target.files[0];
    if (file) setWatermark({ ...watermark, imgUrl: URL.createObjectURL(file), type: 'image' });
  };

  const addMessage = (type) => {
    if (!inputMsg && !selectedImage) return;
    const newMessage = {
      id: Date.now(),
      type: type,
      content: selectedImage || inputMsg,
      contentType: selectedImage ? 'image' : 'text',
      isVideo: isVideo && selectedImage ? true : false
    };
    setMessages([...messages, newMessage]);
    setInputMsg('');
    setSelectedImage(null);
    setIsVideo(false);
  };
  const deleteMessage = (id) => setMessages(messages.filter(msg => msg.id !== id));

  // --- HÀM EXPORT ---
  const handleExport = async () => {
    if (previewRef.current) {
      const originalOverflow = previewRef.current.style.overflow;
      try {
        const canvas = await html2canvas(previewRef.current, { 
          scale: 3, // Tăng chất lượng ảnh lên mức 3
          useCORS: true, 
          allowTaint: true,
          backgroundColor: '#ffffff', // Đảm bảo nền trắng
          width: 375, 
          height: 812,
          scrollX: 0, 
          scrollY: 0,
          windowWidth: 375,
          windowHeight: 812,
          onclone: (doc) => {
            const el = doc.querySelector('.iphone-screen');
            if(el) { 
              el.style.width = '375px'; 
              el.style.height = '812px'; 
              el.style.position = 'fixed'; 
              el.style.top = '0';
              el.style.left = '0';
              // Đảm bảo không còn bo góc nào khi xuất
              el.style.borderRadius = '0';
              
              const allElements = el.querySelectorAll('*');
              allElements.forEach(e => {
                  e.style.fontFamily = 'Arial, sans-serif';
              });
            }
          }
        });
        const link = document.createElement('a');
        link.download = `feedback-${config.partnerName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Export failed", err);
      } finally {
        if (previewRef.current) previewRef.current.style.overflow = originalOverflow;
      }
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        
        {/* --- LEFT PANEL --- */}
        <div className="design-panel">
          <h2 className="panel-title">🛠 Cấu hình Feedback</h2>
          
          <div className="control-group">
            <h3>Thông tin chung</h3>
            <div className="input-row">
              <input type="text" value={config.partnerName} onChange={(e) => setConfig({...config, partnerName: e.target.value})} placeholder="Tên khách" />
              <input type="time" value={config.currentTime} onChange={(e) => setConfig({...config, currentTime: e.target.value})} />
            </div>
            <div className="avatar-upload">
              <label>Avatar Khách:</label>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} />
            </div>
          </div>

          <div className="control-group" style={{border: '1px solid #ffcc00', background: '#fffcf0'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h3>© Watermark / Logo</h3>
              <label className="checkbox-label">
                <input type="checkbox" checked={watermark.show} onChange={(e) => setWatermark({...watermark, show: e.target.checked})} />
                Hiện
              </label>
            </div>
            
            {watermark.show && (
              <div style={{marginTop: 10}}>
                 <div className="input-row">
                   <select value={watermark.type} onChange={(e)=>setWatermark({...watermark, type: e.target.value})}>
                     <option value="text">Dạng Chữ</option>
                     <option value="image">Dạng Ảnh</option>
                   </select>
                 </div>
                 {watermark.type === 'text' ? (
                   <input type="text" value={watermark.content} onChange={(e)=>setWatermark({...watermark, content: e.target.value})} placeholder="Nhập tên shop / SĐT..." />
                 ) : (
                   <input type="file" accept="image/*" onChange={handleWatermarkImage} />
                 )}
                 <div className="slider-control"><Move size={16} /> Pos X: <input type="range" min="-200" max="200" value={watermark.x} onChange={(e)=>setWatermark({...watermark, x: Number(e.target.value)})} /></div>
                 <div className="slider-control"><Move size={16} /> Pos Y: <input type="range" min="-400" max="400" value={watermark.y} onChange={(e)=>setWatermark({...watermark, y: Number(e.target.value)})} /></div>
                 <div className="slider-control"><RotateCw size={16} /> Xoay: <input type="range" min="-180" max="180" value={watermark.rotate} onChange={(e)=>setWatermark({...watermark, rotate: Number(e.target.value)})} /></div>
                 <div className="slider-control"><Maximize size={16} /> To nhỏ: <input type="range" min="0.5" max="3" step="0.1" value={watermark.scale} onChange={(e)=>setWatermark({...watermark, scale: Number(e.target.value)})} /></div>
                 <div className="slider-control"><span>Opacity:</span><input type="range" min="0.1" max="1" step="0.1" value={watermark.opacity} onChange={(e)=>setWatermark({...watermark, opacity: Number(e.target.value)})} /></div>
              </div>
            )}
          </div>

          <div className="control-group highlight">
            <h3>Soạn tin nhắn</h3>
            <textarea placeholder="Nhập nội dung..." value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} disabled={!!selectedImage} />
            <div className="media-controls">
              <label className="file-btn"><ImageIcon size={18} /> Chọn ảnh <input type="file" accept="image/*" hidden onChange={handleImageUpload} /></label>
              {selectedImage && <div className="preview-thumb"><img src={selectedImage} alt="" /><button onClick={() => setSelectedImage(null)} className="remove-img">✕</button></div>}
              <label className="checkbox-label"><input type="checkbox" checked={isVideo} onChange={(e) => setIsVideo(e.target.checked)} disabled={!selectedImage} /> Video?</label>
            </div>
            <div className="action-buttons">
              <button className="btn-receiver" onClick={() => addMessage('receiver')}><Plus size={16} /> Tin Khách</button>
              <button className="btn-sender" onClick={() => addMessage('sender')}><Plus size={16} /> Tin Shop</button>
            </div>
          </div>

          <div className="control-group">
            <div className="list-header">
              <h3>Danh sách tin ({messages.length})</h3>
              <button className="btn-export" onClick={handleExport}><Download size={16} /> Xuất Ảnh</button>
            </div>
            <div className="message-list-mini">
              {messages.map(msg => (
                <div key={msg.id} className={`mini-item ${msg.type}`}>
                  <span>{msg.contentType === 'image' ? '[Hình ảnh]' : msg.content.substring(0, 20) + '...'}</span>
                  <button onClick={() => deleteMessage(msg.id)}><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL --- */}
        <div className="preview-panel">
          <div className="iphone-frame">
            <div className="iphone-screen" ref={previewRef}>
              
              {watermark.show && (
                <div className="watermark-overlay" style={{
                  transform: `translate(-50%, -50%) translate(${watermark.x}px, ${watermark.y}px) rotate(${watermark.rotate}deg) scale(${watermark.scale})`,
                  opacity: watermark.opacity
                }}>
                  {watermark.type === 'image' && watermark.imgUrl ? (
                    <img src={watermark.imgUrl} alt="logo" style={{maxWidth: 150, display:'block'}} />
                  ) : (
                    <span>{watermark.content}</span>
                  )}
                </div>
              )}

              <div className="status-bar">
                <div className="time">{config.currentTime}</div>
                <div className="status-icons"><Signal size={16} fill="black" /><Wifi size={16} /><Battery size={16} fill="black" /></div>
              </div>
              
              <div className="app-header">
                <ChevronLeft size={28} color="#0084FF" />
                <div className="header-user">
                  <div className="avatar-wrapper"><img src={config.avatar} alt="avatar" /><div className="active-dot"></div></div>
                  <div className="user-info"><div className="user-name">{config.partnerName}</div><div className="active-status">Đang hoạt động</div></div>
                </div>
                <div className="header-actions"><Phone size={22} color="#0084FF" /><Video size={26} color="#0084FF" style={{marginLeft: 15}} /></div>
              </div>
              
              <div className="chat-area">
                {messages.map((msg, index) => {
                  const isReceiver = msg.type === 'receiver';
                  const nextMsg = messages[index + 1];
                  const showAvatar = isReceiver && (!nextMsg || nextMsg.type === 'sender');
                  return (
                    <div key={msg.id} className={`message-row ${msg.type}`}>
                      {isReceiver && <div className="tiny-avatar" style={{opacity: showAvatar ? 1 : 0}}><img src={config.avatar} alt="" /></div>}
                      <div className={`bubble ${msg.type} ${msg.contentType === 'image' ? 'is-media' : ''}`}>
                        {msg.contentType === 'text' ? msg.content : (
                          <div className="media-content">
                            <img src={msg.content} alt="sent content" />
                            {msg.isVideo && <div className="play-overlay"><Play size={24} fill="white" color="white" /></div>}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="chat-footer">
                 <div className="footer-icons-left">
                   <PlusCircle size={26} fill="#0084FF" color="white" strokeWidth={1.5} />
                   <Camera size={28} color="#8E8E93" strokeWidth={1.5} />
                   <ImageIcon size={28} color="#8E8E93" strokeWidth={1.5} />
                 </div>
                 <div className="chat-input-fake">
                   <span className="input-placeholder">Aa</span>
                   <Smile size={24} color="#0084FF" strokeWidth={2} />
                 </div>
                 <div className="footer-thumb">
                    <ThumbsUp size={28} color="#0084FF" strokeWidth={2} />
                 </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Feedback;