import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Main from './pages/main';
import SignUp from './pages/signup';
import Login from './pages/login';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Main />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
