import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await axios.delete('/api/api/v1/logout');

        localStorage.removeItem('token');

        navigate('/');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div>
      <p>Cerrando sesión...</p>
    </div>
  );
};

export default Logout;