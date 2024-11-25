import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, Typography } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { BiruAktif, merah } from "../../Colors";
import { useNavigate } from "react-router-dom";

const columns = [
  { id: "no", label: "No", minWidth: 10 },
  { id: "namaPerusahaan", label: "Nama", minWidth: 300 },
  { id: "actions", label: "Aksi", minWidth: 100 },
];

const TableVendor = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const db = getFirestore();

    const fetchData = async () => {
      try {
        const vendorQuery = query(
          collection(db, "vendor"),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(vendorQuery);

        const data = querySnapshot.docs.map((doc, index) => {
          return {
            ...doc.data(),
            no: index + 1,
            id: doc.id,
          };
        });

        setRows(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRowClick = (id) => {
    navigate("/vendor");
  };

  const handleDelete = async () => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "vendor", selectedRowId));
      setRows((prevRows) => prevRows.filter((row) => row.id !== selectedRowId));
      setOpenDialog(false);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleOpenDialog = (id) => {
    setSelectedRowId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <div style={{ margin: 25 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          style={{
            fontWeight: "bold",
            fontSize: 20,
            marginBottom: 5,
            color: "black",
          }}
        >
          Vendor
        </Typography>
        <AddBoxIcon
          style={{ fontSize: 44, color: BiruAktif, marginBottom: 5 }}
          onClick={() => navigate("/tambah-vendor")}
        />
      </div>

      <Paper>
        <TableContainer
          sx={{ maxHeight: "70vh", width: "100%", overflowX: "auto" }}
        >
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          onClick={
                            column.id !== "actions"
                              ? () => handleRowClick(row.id)
                              : null
                          }
                          style={{
                            cursor:
                              column.id !== "actions" ? "pointer" : "default",
                          }}
                        >
                          {column.id === "actions" ? (
                            <Button
                              variant="contained"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenDialog(row.id);
                              }}
                              style={{
                                textTransform: "none",
                                backgroundColor: merah,
                              }}
                            >
                              Hapus
                            </Button>
                          ) : column.format && typeof value === "number" ? (
                            column.format(value)
                          ) : (
                            value
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Konfirmasi Penghapusan
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Apakah Anda yakin ingin menghapus data ini?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            color="primary"
            variant="outlined"
            style={{ textTransform: "none" }}
          >
            Batal
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            autoFocus
            variant="contained"
            style={{ textTransform: "none" }}
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TableVendor;
