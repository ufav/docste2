import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login';
import Main from './main_v1';

const PrivateRoute = ({ component: Component }) => {
  const isAuthenticated = !!localStorage.getItem('token');

  return isAuthenticated ? <Component /> : <Navigate to="/" />;
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<PrivateRoute component={Main} />} />
      </Routes>
    </Router>
  );
}

export default App;
