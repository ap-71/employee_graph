import { Redirect } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  console.debug(isAuthenticated)
  // Показываем индикатор загрузки при проверке аутентификации
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  // Перенаправляем на страницу входа, если пользователь не аутентифицирован
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Отображаем содержимое, если пользователь аутентифицирован
  return children;
} 