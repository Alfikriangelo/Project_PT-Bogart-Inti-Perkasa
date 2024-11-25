import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ClearIcon from "@mui/icons-material/Clear";
import {
  collection,
  addDoc,
  getDocs,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useFirebase } from "../../FirebaseContext";

const BiruAktif = "blue";

const TambahPenawaran = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const { db } = useFirebase();
  const [vendors, setVendors] = useState([]);

  const [alamat, setAlamat] = useState("");
  const [namaperusahaan, setNamaperusahaan] = useState("");
  const [attn, setAttn] = useState("");
  const [project, setProject] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [quoNo, setQuoNo] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [keteranganHarga, setKeteranganHarga] = useState("");
  const [validitas, setValiditas] = useState("");
  const [pengiriman, setPengiriman] = useState("");
  const [pembayaran, setPembayaran] = useState("");
  const [diskon, setDiskon] = useState("");
  const [items, setItems] = useState([
    {
      keterangan: "",
      jumlah: "",
      hargaSatuan: "",
    },
  ]);

  useEffect(() => {
    const fetchVendors = async () => {
      const q = query(collection(db, "vendor"));
      const querySnapshot = await getDocs(q);
      const vendorData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVendors(vendorData);
    };

    fetchVendors();
  }, [db]);

  const handleAddItem = () => {
    setItems([...items, { keterangan: "", jumlah: "", hargaSatuan: "" }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAlert = async (event) => {
    event.preventDefault();

    try {
      setAlertMessage(
        "Apakah Anda yakin ingin menambahkan surat penawaran ini?"
      );
      setOpenDialog(true);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "penawaran"), {
        alamat,
        namaperusahaan,
        attn,
        project,
        email,
        telepon,
        quoNo,
        tanggal,
        keteranganHarga,
        validitas,
        pengiriman,
        pembayaran,
        items,
        diskon,
        createdAt: serverTimestamp(),
      });
      setAlertMessage("Surat penawaran berhasil disimpan");
      resetForm();
      setOpenDialog(false);
      navigate("/");
    } catch (error) {
      console.error("Error menambahkan dokumen: ", error);
      navigate("/");
    }
  };

  const handleBatalkan = () => {
    setOpenDialog(false);
  };

  const resetForm = () => {
    setAlamat("");
    setNamaperusahaan("");
    setAttn("");
    setProject("");
    setEmail("");
    setTelepon("");
    setQuoNo("");
    setTanggal("");
    setKeteranganHarga("");
    setValiditas("");
    setPengiriman("");
    setPembayaran("");
    setDiskon("");
    setItems([{ keterangan: "", jumlah: "", hargaSatuan: "" }]);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "95vw",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
      }}
    >
      <AppBar
        position="static"
        sx={{ width: "100vw", backgroundColor: "white" }}
      >
        <Toolbar
          variant="dense"
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <IconButton
            color="inherit"
            aria-label="menu"
            sx={{ position: "absolute", left: 25 }}
            onClick={() => navigate("/")}
          >
            <ArrowBackIcon style={{ color: BiruAktif }} />
            <Typography
              noWrap
              component="div"
              sx={{
                display: { xs: "none", sm: "block" },
                color: BiruAktif,
                marginLeft: 1,
              }}
            >
              Kembali
            </Typography>
          </IconButton>
          <Typography
            variant="h6"
            color="inherit"
            component="div"
            sx={{ color: BiruAktif, fontWeight: "bold" }}
          >
            Buat Surat Penawaran
          </Typography>
        </Toolbar>
      </AppBar>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 25 }}>
        <div style={{ marginLeft: 25 }}>
          <h3 style={{ marginBottom: 0, color: "black" }}>Kepala surat</h3>
          <TextField
            id="alamat"
            label="Tulis alamat secara lengkap"
            multiline
            rows={4}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            style={{ width: 500, marginTop: 15 }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <h3 style={{ marginBottom: 0, color: "black" }}>
              Informasi tujuan
            </h3>
            <TextField
              select
              id="namaperusahaan"
              label="Perusahaan"
              variant="outlined"
              value={namaperusahaan}
              onChange={(e) => {
                setNamaperusahaan(e.target.value);
                const selectedVendor = vendors.find(
                  (v) => v.namaPerusahaan === e.target.value
                );
                setAttn(selectedVendor ? selectedVendor.up : "");
              }}
              style={{ width: 500, marginTop: 10 }}
            >
              {vendors.map((vendor) => (
                <MenuItem
                  key={vendor.namaPerusahaan}
                  value={vendor.namaPerusahaan}
                >
                  {vendor.namaPerusahaan}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              id="attn"
              label="Attn"
              variant="outlined"
              value={attn}
              onChange={(e) => setAttn(e.target.value)}
              style={{ width: 500, marginTop: 10 }}
            />
            <TextField
              id="project"
              label="Project"
              variant="outlined"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              style={{ width: 500, marginTop: 10 }}
            />
            <TextField
              id="email"
              label="Email"
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: 500, marginTop: 10 }}
            />
            <TextField
              id="telepon"
              label="No telepon"
              variant="outlined"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              style={{ width: 500, marginTop: 10 }}
            />
            <TextField
              id="quoNo"
              label="Quo no"
              variant="outlined"
              value={quoNo}
              onChange={(e) => setQuoNo(e.target.value)}
              style={{ width: 500, marginTop: 10 }}
            />
            <TextField
              id="tanggal"
              label="Tanggal"
              type="date"
              variant="outlined"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              style={{ width: 500, marginTop: 10 }}
              InputLabelProps={{ shrink: true }}
            />
            <h3 style={{ marginBottom: 0, color: "black" }}>Penutup</h3>
            <TextField
              id="keteranganHarga"
              label="Keterangan harga"
              variant="outlined"
              value={keteranganHarga}
              onChange={(e) => setKeteranganHarga(e.target.value)}
              style={{ marginTop: 10 }}
            />
            <TextField
              id="validitas"
              label="Validitas"
              variant="outlined"
              value={validitas}
              onChange={(e) => setValiditas(e.target.value)}
              style={{ marginTop: 10 }}
            />
            <TextField
              id="pengiriman"
              label="Pengiriman"
              variant="outlined"
              value={pengiriman}
              onChange={(e) => setPengiriman(e.target.value)}
              style={{ marginTop: 10 }}
            />
            <TextField
              id="pembayaran"
              label="Pembayaran"
              variant="outlined"
              value={pembayaran}
              onChange={(e) => setPembayaran(e.target.value)}
              style={{ marginTop: 10, marginBottom: 20 }}
            />
          </div>
        </div>

        <div style={{ marginLeft: 125, gap: "10px", marginTop: 20 }}>
          <h3 style={{ marginBottom: 0, color: "black" }}>Isi surat</h3>
          {items.map((item, index) => (
            <div key={index} style={{ marginBottom: 15 }}>
              <div>
                <ClearIcon
                  onClick={() => handleRemoveItem(index)}
                  style={{ marginTop: 10 }}
                />
              </div>
              <TextField
                id={`item-${index}-jumlah`}
                label="Jumlah"
                value={item.jumlah}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index].jumlah = e.target.value;
                  setItems(newItems);
                }}
                style={{ marginTop: 10, marginRight: 10 }}
                inputProps={{
                  min: 0,
                  onKeyDown: (e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  },
                }}
              />
              <TextField
                id={`item-${index}-hargaSatuan`}
                label="Harga Satuan"
                value={item.hargaSatuan}
                onChange={(e) => {
                  const newItems = [...items];
                  // Konversi nilai ke number menggunakan parseFloat (untuk desimal)
                  newItems[index].hargaSatuan = parseFloat(e.target.value) || 0;
                  setItems(newItems);
                }}
                style={{ marginTop: 10, marginRight: 10 }}
                inputProps={{
                  min: 0,
                  onKeyDown: (e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  },
                }}
              />

              <TextField
                id={`item-${index}-keterangan`}
                label="Keterangan"
                multiline
                rows={4}
                value={item.keterangan}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index].keterangan = e.target.value;
                  setItems(newItems);
                }}
                style={{ marginTop: 10, marginRight: 10, width: 500 }}
              />
            </div>
          ))}
          <Button
            variant="contained"
            onClick={handleAddItem}
            style={{ marginTop: 10, textTransform: "none", marginRight: 10 }}
          >
            Tambah Item
          </Button>
          <div style={{ gap: "10px", marginTop: 20 }}>
            <h3 style={{ marginBottom: 0, color: "black" }}>Diskon</h3>
            <TextField
              id="diskon"
              label="Diskon"
              type="number"
              value={diskon}
              onChange={(e) => setDiskon(e.target.value)}
              style={{ marginTop: 20 }}
              inputProps={{
                min: 0,
                onKeyDown: (e) => {
                  if (e.key === "-" || e.key === "e") e.preventDefault();
                },
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginRight: 25,
                marginTop: 10,
                marginBottom: 20,
              }}
            >
              <Button
                variant="contained"
                onClick={handleAlert}
                style={{ textTransform: "none" }}
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={openDialog}
        onClose={handleBatalkan}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Konfirmasi Tambah Data"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {alertMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleBatalkan}
            color="error"
            variant="outlined"
            style={{ textTransform: "none" }}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            style={{ textTransform: "none" }}
          >
            Tambah
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TambahPenawaran;
