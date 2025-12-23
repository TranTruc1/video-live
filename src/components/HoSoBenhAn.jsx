import React, { useState, useRef } from 'react';
import { Button, Input, Modal, message, Row, Col, Divider } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';

const { TextArea } = Input;

// Component ô nhập liệu
const EditableField = ({ value, onChange, placeholder, multiline = false, style, bold = false }) => {
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
    return multiline ? (
      <TextArea
        autoFocus
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={saveEdit}
        autoSize={{ minRows: 2, maxRows: 6 }}
        style={{ ...commonStyle, width: '100%', padding: '5px' }}
      />
    ) : (
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

  return (
    <div
      onClick={toggleEdit}
      style={{
        cursor: 'pointer',
        borderBottom: '1px dotted #ccc',
        minHeight: '28px', // Giữ chiều cao tối thiểu để dòng kẻ vẫn hiện dù không có chữ
        display: 'inline-block',
        minWidth: '50px',
        ...commonStyle,
      }}
      title="Nhấn để chỉnh sửa"
    >
      {value ? (
        value
      ) : (
        // Thêm thuộc tính data-html2canvas-ignore để ẩn khi xuất ảnh
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

const HoSoBenhAn = () => {
  const [data, setData] = useState({
    name: '',
    age: '',
    phone: '',
    address: '',
    status: '', 
    orderDate: new Date().toLocaleDateString('vi-VN'),
    
    // Thông tin liên hệ footer
    contactPhone: '+1 832-650-2216',
    contactMail: 'lutalifeusa@gmail.com',
    contactWeb: 'https://lutalifeusa.online',
    contactAddress: 'Pagemill Rd , Dallas, TX, United States, Texas'
  });

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

  // Styles
  const labelStyle = { fontWeight: 'bold', fontSize: '14pt', marginRight: '5px', fontFamily: 'Arial, sans-serif' };
  const textStyle = { fontWeight: 'normal', fontSize: '14pt', fontFamily: 'Arial, sans-serif' };

  return (
    <div style={{ background: '#333', padding: '30px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Thanh công cụ */}
      <div style={{ marginBottom: '20px' }}>
        <Button type="primary" icon={<EyeOutlined />} size="large" onClick={handleExport} style={{ height: '50px', fontSize: '16px' }}>
          XEM TRƯỚC VÀ LƯU ẢNH
        </Button>
      </div>

      {/* KHUVỰC GIẤY A4 */}
      <div
        ref={printRef}
        style={{
          width: '794px',
          minHeight: '1123px',
          background: '#fff',
          padding: '50px 60px',
          position: 'relative',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14pt',
          lineHeight: '1.5',
          color: '#000',
          boxSizing: 'border-box'
        }}
      >
        {/* LOGO CHÌM */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '30%', 
            opacity: 0.15, 
            pointerEvents: 'none',
            zIndex: 0,
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <img 
            src="./logo.png" 
            alt="LUTA LIFE Logo" 
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.style.display = 'none'; 
            }}
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
          />
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ 
              fontSize: '24pt', fontWeight: 'bold', textTransform: 'uppercase', 
              margin: 0, paddingBottom: '10px', display: 'inline-block', 
              fontFamily: 'Arial, sans-serif', borderBottom: '2px solid #000'
            }}>
              HỒ SƠ BỆNH ÁN
            </h1>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Row gutter={16} align="middle" style={{ marginBottom: '10px' }}>
              <Col span={16} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={labelStyle}>Họ Tên Người Bệnh:</span>
                <EditableField 
                  value={data.name} 
                  onChange={(val) => handleChange('name', val)} 
                  placeholder="Nguyễn Văn A" 
                  style={{ ...textStyle, flex: 1, textTransform: 'uppercase' }} 
                  bold={true}
                />
              </Col>
              <Col span={8} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={labelStyle}>Tuổi:</span>
                <EditableField value={data.age} onChange={(val) => handleChange('age', val)} placeholder="50" style={{ width: '60px', textAlign: 'center' }} />
              </Col>
            </Row>
            
            <Row style={{ marginBottom: '10px' }}>
              <Col span={24} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={labelStyle}>Số Phone:</span>
                <EditableField value={data.phone} onChange={(val) => handleChange('phone', val)} placeholder="09xx..." style={{ flex: 1 }} />
              </Col>
            </Row>

            <Row style={{ marginBottom: '10px' }}>
              <Col span={24} style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={labelStyle}>Địa chỉ:</span>
                <EditableField value={data.address} onChange={(val) => handleChange('address', val)} placeholder="Nhập địa chỉ..." style={{ flex: 1 }} multiline={true} />
              </Col>
            </Row>

             {/* DÒNG TÌNH TRẠNG */}
            <Row style={{ marginBottom: '10px' }}>
              <Col span={24} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={labelStyle}>Tình trạng bệnh:</span>
                <EditableField value={data.status} onChange={(val) => handleChange('status', val)} placeholder="Nhập tình trạng bệnh..." style={{ flex: 1 }} />
              </Col>
            </Row>

            <Row style={{ marginBottom: '10px' }}>
              <Col span={24} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={labelStyle}>Ngày Đặt Hàng:</span>
                <EditableField value={data.orderDate} onChange={(val) => handleChange('orderDate', val)} />
              </Col>
            </Row>
          </div>

          <Divider style={{ borderTop: '1px solid #ccc', margin: '20px 0' }} />

          {/* GHI CHÚ */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ ...labelStyle, textDecoration: 'underline', marginBottom: '10px' }}>Ghi chú:</div>
            <ul style={{ paddingLeft: '25px', margin: 0, ...textStyle }}>
              <li style={{ marginBottom: '8px' }}>
                LUTA LIFE được sản xuất trực tiếp tại USA. Nếu phát hiện hàng giả, hàng nhái, hàng kém chất lượng bồi thường 1.000 USD.
              </li>
              <li>
                LUTA LIFE được FDA và GMP chứng nhận an toàn lành tính vì được chiết xuất từ thiên nhiên như hoa hòe, hoa dâm bụt, củ tỏi...
              </li>
            </ul>
          </div>

          {/* YÊU CẦU */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ ...labelStyle, textDecoration: 'underline', marginBottom: '10px' }}>Yêu Cầu Bệnh Nhân:</div>
            <ul style={{ paddingLeft: '25px', margin: 0, ...textStyle }}>
              <li style={{ marginBottom: '8px' }}>
                Dùng đúng - đủ - đều theo liệu trình và phác đồ điều trị mà chuyên gia đưa ra.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Đo và theo dõi chỉ số huyết áp thường xuyên.
              </li>
              <li>
                10 ngày chuyên gia sẽ liên hệ theo dõi và xem hiệu quả của thuốc với bệnh nhân.
              </li>
            </ul>
          </div>

          <Divider style={{ borderTop: '1px solid #ccc', margin: '20px 0' }} />

          {/* LIÊN HỆ */}
          <div style={{ marginTop: '30px' }}>
            <div style={{ ...textStyle, fontStyle: 'italic', marginBottom: '15px' }}>Mọi thắc mắc xin liên hệ:</div>
            <div style={{ marginLeft: '10px' }}>
               <Row style={{ marginBottom: '8px' }}>
                 <Col span={4}><span style={labelStyle}>Số phone:</span></Col>
                 <Col span={20}>
                    <EditableField value={data.contactPhone} onChange={(val) => handleChange('contactPhone', val)} />
                 </Col>
               </Row>
               <Row style={{ marginBottom: '8px' }}>
                 <Col span={4}><span style={labelStyle}>Mail:</span></Col>
                 <Col span={20}>
                    <EditableField value={data.contactMail} onChange={(val) => handleChange('contactMail', val)} />
                 </Col>
               </Row>
               <Row style={{ marginBottom: '8px' }}>
                 <Col span={4}><span style={labelStyle}>Web:</span></Col>
                 <Col span={20}>
                    <EditableField value={data.contactWeb} onChange={(val) => handleChange('contactWeb', val)} />
                 </Col>
               </Row>
               <Row>
                 <Col span={4}><span style={labelStyle}>Địa chỉ:</span></Col>
                 <Col span={20}>
                    <EditableField value={data.contactAddress} onChange={(val) => handleChange('contactAddress', val)} multiline={true} />
                 </Col>
               </Row>
            </div>
          </div>

        </div>
      </div>

      <Modal
        title="Xem trước ảnh"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>Sửa lại</Button>,
          <Button key="submit" type="primary" icon={<DownloadOutlined />} onClick={handleSave} size="large">LƯU ẢNH NGAY</Button>,
        ]}
        width={700}
        centered
      >
        {previewImage && <img src={previewImage} alt="Preview" style={{ width: '100%', border: '1px solid #ddd' }} />}
      </Modal>
    </div>
  );
};

export default HoSoBenhAn;