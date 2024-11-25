import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  TextField,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useFirebase } from "../../FirebaseContext";
import { BiruAktif } from "../../Colors";

const TambahVendor = () => {
  const navigate = useNavigate();
  const { db } = useFirebase();
  const [formData, setFormData] = useState({
    namaPerusahaan: "",
    alamat: "",
    up: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false); // Untuk dialog konfirmasi
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // Untuk konfirmasi penyimpanan
  const [dialogMessage, setDialogMessage] = useState("");

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
  };

  const resetForm = () => {
    setFormData({ namaPerusahaan: "", alamat: "", up: "" });
  };

  const handleConfirmSubmit = () => {
    setConfirmDialogOpen(true); // Buka dialog konfirmasi sebelum submit
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "vendor"), {
        ...formData,
        timestamp: serverTimestamp(),
      });
      setDialogMessage("Data Berhasil Ditambahkan!");
      setDialogOpen(true);
      resetForm();
      navigate("/vendor");
    } catch (error) {
      setDialogMessage(`Gagal menyimpan data: ${error.message}`);
      setDialogOpen(true);
      console.error("Error menambahkan dokumen: ", error);
    } finally {
      setConfirmDialogOpen(false); // Tutup dialog konfirmasi
    }
  };

  // Fungsi untuk menutup dialog alert
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Fungsi untuk menutup dialog konfirmasi
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  return (
    <div style={{ width: "100%", height: "100vh", backgroundColor: "white" }}>
      <AppBar
        position="static"
        sx={{ width: "100vw", backgroundColor: "white" }}
      >
        <Toolbar
          variant="dense"
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <IconButton
            aria-label="back"
            sx={{ position: "absolute", left: 30 }}
            onClick={() => navigate("/vendor")}
          >
            <ArrowBackIcon style={{ color: BiruAktif }} />
            <Typography noWrap sx={{ color: BiruAktif, marginLeft: 1 }}>
              Kembali
            </Typography>
          </IconButton>
          <Typography
            variant="h6"
            sx={{ color: BiruAktif, fontWeight: "bold" }}
          >
            Vendor Baru
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Form berada di tengah halaman */}
      <div
        style={{
          display: "flex",
          justifyContent: "center", // Mengeset posisi form di tengah secara horizontal
          marginTop: 25,
        }}
      >
        <div
          style={{
            width: "50%", // Atur lebar form sesuai kebutuhan
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Efek bayangan
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmSubmit();
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <TextField
                  id="namaPerusahaan"
                  label="Nama Perusahaan"
                  variant="outlined"
                  value={formData.namaPerusahaan}
                  onChange={handleInputChange}
                  fullWidth
                />
              </div>
              <div>
                <TextField
                  id="alamat"
                  label="Alamat"
                  variant="outlined"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  fullWidth
                />
              </div>
              <div>
                <TextField
                  id="up"
                  label="Up"
                  variant="outlined"
                  value={formData.up}
                  onChange={handleInputChange}
                  fullWidth
                />
              </div>
            </div>

            <div style={{ marginTop: 25, textAlign: "right" }}>
              <Button
                type="submit"
                variant="contained"
                sx={{ textTransform: "none" }}
              >
                Simpan
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Dialog konfirmasi penyimpanan */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {"Konfirmasi Penyimpanan"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Apakah Anda yakin ingin menyimpan data ini?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmDialogClose}
            color="error"
            variant="outlined"
            style={{ textTransform: "none" }}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            autoFocus
            variant="contained"
            style={{ textTransform: "none" }}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Informasi"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TambahVendor;
