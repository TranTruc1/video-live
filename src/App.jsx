import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FBLiveEditorLight from './components/FBLiveEditorLight';
import HoSoBenhAn from './components/HoSoBenhAn';
import Feedback from './components/Feedback';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn trang chủ "/" */}
        <Route path="/" element={<FBLiveEditorLight />} />

        {/* Đường dẫn "/hosobenhan" */}
        <Route path="/hosobenhan" element={<HoSoBenhAn />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
