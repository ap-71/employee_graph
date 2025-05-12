import { Box, Typography } from "@mui/material";
import 'reactflow/dist/style.css';
import GraphComponent from "../components/GraphComponent";
import { useSearchParams } from "wouter";

export default function Graph({ publicView=false } = {}) {
  const [searchParams] = useSearchParams();
  const headText = searchParams.get("headText") || "Граф";

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {headText}
      </Typography>
      <GraphComponent publicView={publicView}/>
    </Box>
  );
} 