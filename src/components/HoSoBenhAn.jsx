import React, { useState, useRef } from 'react';
import { Button, Input, Modal, message, Row, Col, Divider, Select } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';

const { TextArea } = Input;

// --- COMPONENT Ô NHẬP LIỆU ĐA NĂNG (TEXT/SELECT) ---
const EditableField = ({ value, onChange, placeholder, multiline = false, style, bold = false, options = [] }) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const toggleEdit = () => {
    setEditing(!editing);
    setTempValue(value);
  };

  const saveEdit = () => {
    setEditing(false);
    onChange(tempValue);
  };

  const commonStyle = {
    fontSize: '14pt',
    fontFamily: 'Arial, sans-serif',
    fontWeight: bold ? 'bold' : 'normal',
    color: '#000',
    ...style
  };

  if (editing) {
    // 1. Nếu có danh sách options -> Hiển thị Select box
    if (options && options.length > 0) {
      return (
        <Select
          defaultOpen={true}
          autoFocus={true}
          value={tempValue}
          style={{ ...commonStyle, width: '100%' }}
          onChange={(val) => {
            setTempValue(val);
            onChange(val);
            setEditing(false);
          }}
          onBlur={() => {
            setEditing(false);
          }}
          // --- SỬA Ở ĐÂY: Thêm index (1., 2., ...) vào label hiển thị ---
          options={options.map((opt, index) => ({ 
            label: `${index + 1}. ${opt}`, // Hiển thị: "1. Địa chỉ A"
            value: opt                     // Giá trị thực: "Địa chỉ A"
          }))}
          // -----------------------------------------------------------
          dropdownStyle={{ minWidth: '350px' }} // Menu rộng hơn chút để hiển thị đủ
        />
      );
    }

    // 2. Nếu là multiline -> Hiển thị TextArea
    if (multiline) {
      return (
        <TextArea
          autoFocus
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={saveEdit}
          autoSize={{ minRows: 2, maxRows: 6 }}
          style={{ ...commonStyle, width: '100%', padding: '5px' }}
        />
      );
    }

    // 3. Mặc định -> Hiển thị Input thường
    return (
      <Input
        autoFocus
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={saveEdit}
        onPressEnter={saveEdit}
        style={{ ...commonStyle, width: '100%', height: 'auto', padding: '5px' }}
      />
    );
  }

  // --- CHẾ ĐỘ HIỂN THỊ (VIEW MODE) ---
  return (
    <div
      onClick={toggleEdit}
      style={{
        cursor: 'pointer',
        borderBottom: '1px dotted #ccc',
        minHeight: '28px',
        display: 'inline-block',
        minWidth: '50px',
        ...commonStyle,
      }}
      title="Nhấn để chỉnh sửa"
    >
      {value ? (
        value
      ) : (
        <span
          data-html2canvas-ignore="true"
          style={{ color: '#ccc', fontStyle: 'italic', fontWeight: 'normal' }}
        >
          {placeholder}
        </span>
      )}
    </div>
  );
};

// --- COMPONENT CHÍNH ---
const HoSoBenhAn = () => {
  const [data, setData] = useState({
    name: '',
    age: '',
    phone: '',
    address: '',
    status: '',
    orderDate: new Date().toLocaleDateString('vi-VN'),
    contactPhone: '+1 832-650-2216',
    contactMail: 'lutalifeusa@gmail.com',
    contactWeb: 'https://lutalifeusa.online',
    contactAddress: 'Pagemill Rd , Dallas, TX, United States, Texas'
  });

  // DANH SÁCH ĐỊA CHỈ (Dữ liệu gốc)
  const addressOptions = [
    "Pagemill Rd , Dallas, TX, United States, Texas",
    "2334 Dorrington St Houston, Texas",
    "1841 1/2 N Alexandria Ave, Los Angeles, CA 90027",
    "2 Bradnor St, Carina QLD 4152, Úc",
    "2015 Av. Bergemont, Quebec, QC G1J 3T5, Canada"
  ];

  const printRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleChange = (key, value) => {
    setData({ ...data, [key]: value });
  };

  const handleExport = async () => {
    if (printRef.current) {
      try {
        const canvas = await html2canvas(printRef.current, {
          scale: 3, 
          useCORS: true, 
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        setPreviewImage(imgData);
        setIsModalVisible(true);
      } catch (error) {
        message.error('Lỗi xuất ảnh: ' + error.message);
      }
    }
  };

  const handleSave = () => {
    if (previewImage) {
      const link = document.createElement('a');
      link.href = previewImage;
      link.download = `Ho_So_Benh_An_${data.name || 'LutaLife'}.png`;
      link.click();
      setIsModalVisible(false);
    }
  };

  const labelStyle = { fontWeight: 'bold', fontSize: '14pt', marginRight: '5px', fontFamily: 'Arial, sans-serif' };
  const textStyle = { fontWeight: 'normal', fontSize: '14pt', fontFamily: 'Arial, sans-serif' };
  
  return (
    <div style={{ background: '#333', padding: '20px 0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* THANH CÔNG CỤ */}
      <div style={{ marginBottom: '20px' }}>
        <Button type="primary" icon={<EyeOutlined />} size="large" onClick={handleExport} style={{ height: '50px', fontSize: '16px' }}>
          XEM TRƯỚC VÀ LƯU ẢNH
        </Button>
      </div>

      {/* --- WRAPPER CUỘN NGANG --- */}
      <div style={{ 
          width: '100%', 
          overflowX: 'auto', 
          display: 'flex', 
          justifyContent: 'center', 
          paddingBottom: '20px' 
      }}>
          
          {/* KHUVỰC GIẤY A4 CỐ ĐỊNH */}
          <div
            ref={printRef}
            style={{
              width: '794px',
              minHeight: '1123px', 
              flexShrink: 0, 
              position: 'relative',
              background: '#fff',
              boxSizing: 'border-box',
              overflow: 'hidden',
              boxShadow: '0 10px 20px rgba(0,0,0,0.19)',
            }}
          >
            
            {/* LAYER 0: KHUNG NỀN */}
            <img 
              src="/khung.png" 
              alt="Khung nền"
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                objectFit: 'stretch', zIndex: 0,
              }}
              onError={(e) => {
                 e.target.style.display = 'none';
                 message.warning('Chưa tìm thấy file public/khung.png');
              }}
            />

            {/* LAYER 1: LOGO CHÌM */}
            <div
              style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '30%', opacity: 0.15, pointerEvents: 'none', zIndex: 1,
                textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}
            >
              <img
                src="./logo.png"
                alt="LUTA LIFE Logo"
                onError={(e) => { e.target.style.display = 'none'; }}
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>

            {/* LAYER 2: NỘI DUNG VĂN BẢN */}
            <div style={{ 
                position: 'relative', 
                zIndex: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '80px 90px 100px 90px', 
                fontFamily: 'Arial, sans-serif',
                fontSize: '14pt',
                lineHeight: '1.5',
                color: '#000',
            }}>
                
                {/* PHẦN THÂN TRÊN */}
                <div>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                      <h1 style={{
                        fontSize: '24pt', fontWeight: 'bold', textTransform: 'uppercase',
                        margin: 0, paddingBottom: '10px', display: 'inline-block',
                        fontFamily: 'Arial, sans-serif', borderBottom: '2px solid #000'
                      }}>
                        HỒ SƠ BỆNH ÁN
                      </h1>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      
                      <Row style={{ marginBottom: '10px' }}>
                        <Col span={24} style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={labelStyle}>Họ tên người bệnh:</span>
                          <EditableField
                            value={data.name}
                            onChange={(val) => handleChange('name', val)}
                            placeholder="Nguyễn Văn A"
                            style={{ ...textStyle, flex: 1, textTransform: 'uppercase' }}
                            bold={true}
                          />
                        </Col>
                      </Row>

                      <Row gutter={24} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={labelStyle}>Tuổi:</span>
                          <EditableField 
                            value={data.age} 
                            onChange={(val) => handleChange('age', val)} 
                            placeholder="50" 
                            style={{ width: '60px', textAlign: 'center' }} 
                          />
                        </Col>
                        <Col span={16} style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={labelStyle}>Phone:</span>
                          <EditableField 
                            value={data.phone} 
                            onChange={(val) => handleChange('phone', val)} 
                            placeholder="09xx..." 
                            style={{ flex: 1 }} 
                          />
                        </Col>
                      </Row>

                      <Row style={{ marginBottom: '10px' }}>
                        <Col span={24} style={{ display: 'flex', alignItems: 'baseline' }}>
                          <span style={labelStyle}>Địa chỉ:</span>
                          <EditableField value={data.address} onChange={(val) => handleChange('address', val)} placeholder="Nhập địa chỉ..." style={{ flex: 1 }} multiline={true} />
                        </Col>
                      </Row>

                      <Row style={{ marginBottom: '10px' }}>
                        <Col span={24} style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={labelStyle}>Tình trạng bệnh:</span>
                          <EditableField value={data.status} onChange={(val) => handleChange('status', val)} placeholder="Nhập tình trạng bệnh..." style={{ flex: 1 }} />
                        </Col>
                      </Row>

                      <Row style={{ marginBottom: '10px' }}>
                        <Col span={24} style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={labelStyle}>Ngày đặt hàng:</span>
                          <EditableField value={data.orderDate} onChange={(val) => handleChange('orderDate', val)} />
                        </Col>
                      </Row>
                    </div>

                    <Divider style={{ borderTop: '1px solid #ccc', margin: '20px 0' }} />

                    <div style={{ marginBottom: '25px' }}>
                      <div style={{ ...labelStyle, textDecoration: 'underline', marginBottom: '10px' }}>Ghi chú:</div>
                      <ul style={{ paddingLeft: '25px', margin: 0, ...textStyle }}>
                        <li style={{ marginBottom: '8px' }}>
                          - LUTA LIFE được sản xuất trực tiếp tại USA. Nếu phát hiện hàng giả, hàng nhái, hàng kém chất lượng bồi thường 1.000 USD.
                        </li>
                        <li>
                          - LUTA LIFE được FDA và GMP chứng nhận an toàn lành tính vì được chiết xuất từ thiên nhiên như hoa hòe, hoa dâm bụt, củ tỏi...
                        </li>
                      </ul>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                      <div style={{ ...labelStyle, textDecoration: 'underline', marginBottom: '10px' }}>Yêu Cầu Bệnh Nhân:</div>
                      <ul style={{ paddingLeft: '25px', margin: 0, ...textStyle }}>
                        <li style={{ marginBottom: '8px' }}>
                          - Dùng đúng - đủ - đều theo liệu trình và phác đồ điều trị mà chuyên gia đưa ra.
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                          - Đo và theo dõi chỉ số huyết áp thường xuyên.
                        </li>
                        <li>
                          - 10 ngày chuyên gia sẽ liên hệ theo dõi và xem hiệu quả của thuốc với bệnh nhân.
                        </li>
                      </ul>
                    </div>
                </div>

                {/* PHẦN CHÂN TRANG */}
                <div style={{ marginTop: 'auto', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                  <div style={{ ...textStyle, fontStyle: 'italic', marginBottom: '15px' }}>Mọi thắc mắc xin liên hệ:</div>
                  <div style={{ marginLeft: '10px' }}>
                    <Row style={{ marginBottom: '8px' }}>
                      <Col span={6}><span style={labelStyle}>Số phone:</span></Col>
                      <Col span={18}>
                        <EditableField value={data.contactPhone} onChange={(val) => handleChange('contactPhone', val)} />
                      </Col>
                    </Row>
                    <Row style={{ marginBottom: '8px' }}>
                      <Col span={6}><span style={labelStyle}>Mail:</span></Col>
                      <Col span={18}>
                        <EditableField value={data.contactMail} onChange={(val) => handleChange('contactMail', val)} />
                      </Col>
                    </Row>
                    <Row style={{ marginBottom: '8px' }}>
                      <Col span={6}><span style={labelStyle}>Web:</span></Col>
                      <Col span={18}>
                        <EditableField value={data.contactWeb} onChange={(val) => handleChange('contactWeb', val)} />
                      </Col>
                    </Row>
                    <Row>
                      <Col span={6}><span style={labelStyle}>Địa chỉ:</span></Col>
                      <Col span={18}>
                        {/* SELECT BOX VỚI SỐ THỨ TỰ */}
                        <EditableField 
                          value={data.contactAddress} 
                          onChange={(val) => handleChange('contactAddress', val)} 
                          options={addressOptions} 
                        />
                      </Col>
                    </Row>
                  </div>
                </div>

            </div>
          </div>
      </div>

      {/* MODAL */}
      <Modal
        title="Xem trước ảnh"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>Sửa lại</Button>,
          <Button key="submit" type="primary" icon={<DownloadOutlined />} onClick={handleSave} size="large">
            Tải về (PC/Android)
          </Button>,
        ]}
        width={700}
        centered
        style={{ maxWidth: '95vw' }}
      >
        <div style={{ textAlign: 'center' }}>
            <div style={{ 
                marginBottom: '15px', 
                padding: '10px', 
                background: '#fffbe6', 
                border: '1px solid #ffe58f',
                borderRadius: '4px',
                color: '#d48806',
                fontWeight: 'bold',
                fontSize: '14px'
            }}>
                ⚠️ Trên iPhone/iPad (Safari): <br/>
                Hãy <u>CHẠM VÀ GIỮ</u> vào ảnh bên dưới, sau đó chọn <u>"Lưu vào Ảnh"</u> (Save to Photos).
            </div>

            {previewImage && (
                <img 
                    src={previewImage} 
                    alt="Preview" 
                    style={{ 
                        width: '100%', 
                        border: '1px solid #ddd',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
                    }} 
                />
            )}
        </div>
      </Modal>
    </div>
  );
};

export default HoSoBenhAn;