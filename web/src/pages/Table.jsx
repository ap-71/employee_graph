import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Typography } from "@mui/material";

const colsTmp = [
  { field: "id", headerName: "ID" },
  { field: "name", headerName: "Name" },
  { field: "trololo", headerName: "trololo" },
];
const rowsTmp = [
  { id: 1, name: "Frozen yoghurt", trololo: "trololo" },
  { id: 1, name: "Frozen yoghurt", trololo: "trololo" },
];

export const BasicTable = ({
  rows = [...rowsTmp],
  cols = [...colsTmp],
} = {}) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {cols.map((col) => (
              <TableCell key={col.field} align={col.align || "left"}>{col.headerName || col.field}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center">
                Здесь пока еще ничего нет
              </TableCell>
            </TableRow>
          )}
          {rows.map((row, rI) => {
            const cells = cols
              .map((col, cI) => {
                const current = row[col.field];

                return <TableCell key={cI} component="th" scope="row" align={col.align || "left"}>
                    {current || "-"}
                </TableCell>;
              })
              .filter((f) => f);

            return (
              <TableRow
                key={rI}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {cells}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
