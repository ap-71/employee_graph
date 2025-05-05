import { Redirect } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

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

  // Перенаправляем на главную страницу, если пользователь уже аутентифицирован
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  // Отображаем содержимое, если пользователь не аутентифицирован
  return children;
} 