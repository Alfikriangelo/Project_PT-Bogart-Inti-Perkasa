import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { BiruAktif, merah } from "../../Colors";
import DeleteIcon from "@mui/icons-material/Delete";

const CardHutang = () => {
  const [hutang, setHutang] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHutangId, setSelectedHutangId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const db = getFirestore();

    const fetchData = async () => {
      try {
        const hutangQuery = query(
          collection(db, "po-pdf"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(hutangQuery);
        const data = querySnapshot.docs.map((doc, index) => ({
          ...doc.data(),
          no: index + 1,
          id: doc.id,
        }));

        setHutang(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleOpenDialog = (id) => {
    console.log("ID yang dipilih untuk dihapus: ", id);
    setSelectedHutangId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedHutangId(null);
  };

  const handleDelete = async () => {
    if (!selectedHutangId) return;

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "po-pdf", selectedHutangId)); // Sesuaikan path collection

      // Memperbarui state setelah dokumen dihapus
      setHutang((prevHutang) => {
        const updatedHutang = prevHutang.filter(
          (hutang) => hutang.id !== selectedHutangId
        );

        // Memperbarui nomor urut setelah penghapusan
        return updatedHutang.map((hutang, index) => ({
          ...hutang,
          no: index + 1,
        }));
      });

      handleCloseDialog(); // Menutup dialog
    } catch (error) {
      console.log("Error deleting document:", error);
    }
  };

  const totalHutangSetiapItem = (items) => {
    let total = 0;

    if (Array.isArray(items)) {
      items.forEach((item) => {
        if (item.totalHarga) {
          total += item.totalHarga;
        }
      });
    } else {
      console.error("Items bukan array atau undefined.");
    }

    return total;
  };

  return (
    <div
      style={{
        marginLeft: 25,
        marginTop: 25,
        display: "flex",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      {hutang.map((hutang, index) => {
        const totalHarga = totalHutangSetiapItem(hutang.items);
        const totalDiskon = parseFloat(hutang.discountValue);
        const totalPpn = parseFloat(hutang.ppnValue);

        return (
          <Card
            key={hutang.id}
            style={{
              maxWidth: 445,
              marginBottom: 2,
              backgroundColor: BiruAktif,
              borderRadius: 10,
            }}
          >
            <CardContent>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
                >
                  {hutang.kepada || "Data tidak ada"}
                </Typography>
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography style={{ color: "white" }}>
                  Total project
                </Typography>
                <Typography style={{ color: "white" }}>
                  Rp. {totalHarga.toLocaleString("id-ID")}
                </Typography>
              </div>
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 20,
                }}
              >
                <Typography style={{ color: "white" }}>Sisa Tagihan</Typography>
                <Typography style={{ color: "white" }}>
                  Rp. {hutang.finalPrice.toLocaleString("id-ID")}
                </Typography>
              </div>
            </CardContent>
            <CardActions
              style={{
                justifyContent: "flex-end",
                paddingBottom: 15,
                paddingRight: 15,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate(`/detail-hutang/${hutang.id}`)}
                style={{ backgroundColor: "white", textTransform: "none" }}
              >
                Lihat
              </Button>
              <Button
                variant="contained"
                style={{
                  textTransform: "none",
                  backgroundColor: merah,
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleOpenDialog(hutang.id);
                }}
              >
                Hapus
              </Button>
            </CardActions>
          </Card>
        );
      })}
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

export default CardHutang;
