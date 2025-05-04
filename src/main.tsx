import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeScreen from './screens/HomeScreen.tsx';
import ChatScreen from './screens/ChatScreen.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomeScreen />} /> 
          <Route path="chat" element={<ChatScreen />} /> 
          <Route path="chat/:chatId" element={<ChatScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
