import { createContext, useState, useContext, useEffect } from 'react';
import { getToken, registerAccount } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});

  useEffect(() => {
    const storedTokenData = localStorage.getItem('token_data');
    if (storedTokenData && storedTokenData !== 'undefined') {
      try {
        setToken(JSON.parse(storedTokenData));
      } catch (error) {
        console.error('Error parsing token_data from localStorage:', error);
        localStorage.removeItem('token_data'); // Удаляем некорректные данные
      }
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    getToken(data).then(tokenData => {
      setToken(tokenData?.access_token)
  
      localStorage.setItem('token_data', JSON.stringify(tokenData));
    })
  };

  const register = async (data) => {
    registerAccount(data).then(tokenData => {
      setToken(tokenData?.access_token)
  
      localStorage.setItem('token_data', JSON.stringify(tokenData));
    })
    return { success: true };
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token_data');
  };

  return <AuthContext.Provider value={{
    user,
    setUser,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!token,
  }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
} 