import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import {
  Button,
  Typography,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { BiruAktif, merah } from "../../Colors";
import { useNavigate } from "react-router-dom";

const columns = [
  { id: "no", label: "No", minWidth: 10 },
  { id: "quoNo", label: "No Surat", minWidth: 100 },
  { id: "tanggal", label: "Tanggal PO", minWidth: 100 },
  { id: "namaperusahaan", label: "Perusahaan", minWidth: 200 },
  { id: "keterangan", label: "Keterangan", minWidth: 300 },
  {
    id: "total",
    label: "Total",
    minWidth: 120,
    format: (value) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value),
  },
  { id: "status", label: "Status", minWidth: 100 },
  { id: "actions", label: "Aksi", minWidth: 100 },
];

const TablePenawaran = () => {
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
        const penawaranQuery = query(
          collection(db, "penawaran"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(penawaranQuery);

        const data = querySnapshot.docs.map((doc, index) => {
          const docData = doc.data();

          const keterangan =
            docData.items && docData.items[0]
              ? docData.items[0].keterangan
              : "";

          const totalHargaBarang = docData.items
            ? docData.items.reduce(
                (acc, item) =>
                  acc + (item.hargaSatuan || 0) * (item.jumlah || 0),
                0
              )
            : 0;

          const diskonValue = (totalHargaBarang * docData.diskon) / 100;

          return {
            ...docData,
            no: index + 1,
            keterangan,
            total: totalHargaBarang - diskonValue,
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
    navigate(`/detail-penawaran/${id}`);
  };

  const handleDelete = async () => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "penawaran", selectedRowId));
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      const db = getFirestore();
      const docRef = doc(db, "penawaran", id);
      await updateDoc(docRef, { status: newStatus });

      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, status: newStatus } : row
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
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
          Penawaran
        </Typography>
        <AddBoxIcon
          style={{ fontSize: 44, color: BiruAktif, marginBottom: 5 }}
          onClick={() => navigate("/tambah-penawaran")}
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
                            column.id !== "actions" && column.id !== "status"
                              ? () => handleRowClick(row.id)
                              : null
                          }
                          style={{
                            cursor:
                              column.id !== "actions" ? "pointer" : "default",
                          }}
                        >
                          {column.id === "status" ? (
                            <Select
                              value={row.status || ""}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(row.id, e.target.value);
                              }}
                              displayEmpty
                              size="small"
                              style={{
                                minWidth: 100,
                                border: "1px solid",
                                borderColor:
                                  row.status === "Berhasil"
                                    ? "#06D001"
                                    : row.status === "Ditolak"
                                    ? "#FF7777"
                                    : "gray",
                                color:
                                  row.status === "Berhasil"
                                    ? "#06D001"
                                    : row.status === "Ditolak"
                                    ? "#FF7777"
                                    : "black",
                              }}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              <MenuItem value="Pending">Pending</MenuItem>
                              <MenuItem value="Berhasil">Berhasil</MenuItem>
                              <MenuItem value="Ditolak">Ditolak</MenuItem>
                            </Select>
                          ) : column.id === "actions" ? (
                            <Button
                              variant="contained"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenDialog(row.id); // Membuka dialog konfirmasi
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

export default TablePenawaran;
