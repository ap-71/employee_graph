import { useAuth } from "../context/AuthContext";
import { Box, Stack, Typography } from "@mui/material";
import 'reactflow/dist/style.css';
import GraphComponent from "../components/GraphComponent";

export default function Graph() {
  const { token } = useAuth();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Граф
      </Typography>
      <GraphComponent />
    </Box>
  );
} 