import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import {
  Typography,
  AppBar,
  Toolbar,
  Button,
  Paper,
  Checkbox,
} from "@mui/material";
import { BiruAktif, BiruDonker, BiruMuda, merah } from "../../Colors";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";

const DetailHutang = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (location.state?.detail) {
      setDetail(location.state.detail);
    } else {
      const fetchDetail = async () => {
        try {
          const db = getFirestore();
          const docRef = doc(db, "po-pdf", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setDetail(docSnap.data());
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching detail:", error);
        }
      };

      fetchDetail();
    }
  }, [id, location.state]);

  if (!detail) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography variant="h6">Loading...</Typography>
        <Button
          style={{ marginTop: 10 }}
          variant="outlined"
          onClick={() => navigate("/")}
        >
          Kembali
        </Button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const calculateTotalPrice = () => {
    if (Array.isArray(detail.items)) {
      return detail.items.reduce((acc, item) => {
        return acc + item.jumlah * item.hargaSatuan;
      }, 0);
    }
    return 0;
  };

  const totalPrice = calculateTotalPrice();
  const discountPercentage = detail?.diskon || 0;
  const discountValue = (totalPrice * discountPercentage) / 100;
  const finalPrice = totalPrice - discountValue;

  const stringUangMuka = `Rp. ${detail.uangMuka.toLocaleString() || 0}`;
  const uangMuka = parseInt(stringUangMuka.replace(/[^0-9]/g, ""), 10);

  const percentagePPN = (detail.ppnValue / finalPrice) * 100;

  return (
    <div style={{ width: "100vw", height: "100vw", backgroundColor: "white" }}>
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
            onClick={() => navigate("/hutang")}
          >
            <ArrowBackIcon style={{ color: BiruAktif }} />
            <Typography
              noWrap
              component="div"
              sx={{
                display: { xs: "none", sm: "block", color: BiruAktif },
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
            Detail Hutang
          </Typography>
        </Toolbar>
      </AppBar>
      <div style={{ marginLeft: 100, marginRight: 100 }}>
        <Paper
          elevation={1}
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "space-between",
            padding: 50,
            borderRadius: "15px 15px 0px 0px",
            backgroundColor: BiruDonker,
          }}
        >
          <div>
            <Typography
              style={{ fontWeight: "bold", color: "white", fontSize: 25 }}
            >
              {detail.kepada}
            </Typography>
            <Typography style={{ color: "white", fontSize: 25 }}>
              {detail.suratNo}
            </Typography>
          </div>

          <div>
            {detail.jatuhTempo ? (
              <Typography
                style={{ fontWeight: "bold", color: "white", fontSize: 25 }}
              >
                {formatDate(detail.jatuhTempo)}
              </Typography>
            ) : (
              <Typography
                style={{ fontWeight: "bold", color: "white", fontSize: 25 }}
              >
                Belum ada data jatuh tempo
              </Typography>
            )}
          </div>
        </Paper>

        <Paper
          elevation={1}
          style={{
            padding: 50,
            borderRadius: "0px 0px 15px 15px",
            backgroundColor: BiruAktif,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex" }}>
                <Typography
                  style={{ color: "white", fontSize: 18, marginBottom: 15 }}
                >
                  Tanggal Pembayaran :
                </Typography>
                <Typography
                  style={{
                    color: "white",
                    fontSize: 18,
                    marginBottom: 15,
                    marginLeft: 5,
                  }}
                >
                  {detail.suratNo
                    ? formatDate(detail.tanggalPembayaran)
                    : "Tidak ada data"}
                </Typography>
              </div>
              <Typography
                style={{
                  color: "white",
                  fontSize: 18,
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                Tanggal PO :
                {detail.tanggalPO ? (
                  <Typography style={{ fontSize: 18, marginLeft: 5 }}>
                    {formatDate(detail.tanggalPO)}
                  </Typography>
                ) : (
                  <Typography style={{ fontSize: 18 }}>
                    Tidak ada data
                  </Typography>
                )}
              </Typography>
              <div style={{ marginTop: 15 }}>
                {Array.isArray(detail.items) ? (
                  detail.items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <Typography style={{ color: "white", fontSize: 18 }}>
                        {item.keterangan}
                      </Typography>
                    </div>
                  ))
                ) : (
                  <Typography style={{ color: "red", fontSize: 18 }}>
                    Tidak ada data keterangan
                  </Typography>
                )}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", flexDirection: "row", gap: 50 }}>
                <div>
                  {Array.isArray(detail.items) ? (
                    detail.items.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <Typography style={{ color: "white", fontSize: 18 }}>
                          {item.keterangan}
                        </Typography>
                      </div>
                    ))
                  ) : (
                    <Typography style={{ color: "red", fontSize: 18 }}>
                      Tidak ada data keterangan
                    </Typography>
                  )}
                </div>
                <div>
                  {Array.isArray(detail.items) ? (
                    detail.items.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <Typography style={{ color: "white", fontSize: 18 }}>
                          Rp. {item.hargaSatuan.toLocaleString()}
                        </Typography>
                      </div>
                    ))
                  ) : (
                    <Typography style={{ color: "red", fontSize: 18 }}>
                      Tidak ada data keterangan
                    </Typography>
                  )}
                </div>
                <div>
                  {Array.isArray(detail.items) ? (
                    detail.items.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <Typography style={{ color: "white", fontSize: 18 }}>
                          x{item.jumlah}
                        </Typography>
                      </div>
                    ))
                  ) : (
                    <Typography style={{ color: "red", fontSize: 18 }}>
                      Tidak ada data keterangan
                    </Typography>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ marginRight: 5 }}>
                <Typography style={{ color: "white", fontSize: 18 }}>
                  Subtotal
                </Typography>
                <Typography style={{ color: "white", fontSize: 18 }}>
                  Diskon
                </Typography>
                <Typography style={{ color: "white", fontSize: 18 }}>
                  Uang Muka
                </Typography>
                <Typography style={{ color: "white", fontSize: 18 }}>
                  PPN ({percentagePPN}%)
                </Typography>
                <Typography
                  style={{ color: "white", fontSize: 18, marginTop: 25 }}
                >
                  Sisa Hutang
                </Typography>
              </div>
              <div>
                <Typography style={{ color: "white", fontSize: 18 }}>
                  :
                </Typography>
                <Typography style={{ color: "white", fontSize: 18 }}>
                  :
                </Typography>
                <Typography style={{ color: "white", fontSize: 18 }}>
                  :
                </Typography>
                <Typography style={{ color: "white", fontSize: 18 }}>
                  :
                </Typography>
                <Typography
                  style={{ color: "white", fontSize: 18, marginTop: 25 }}
                >
                  :
                </Typography>
              </div>

              <div style={{ marginLeft: 10 }}>
                <Typography style={{ color: "white", fontSize: 18 }}>
                  Rp. {finalPrice.toLocaleString()}
                </Typography>
                <Typography style={{ color: "white", fontSize: 18 }}>
                  Rp. - {detail.discountValue.toLocaleString()}
                </Typography>
                <Typography style={{ color: "white", fontSize: 18 }}>
                  Rp. - {uangMuka.toLocaleString()}
                </Typography>
                <Typography style={{ color: "white", fontSize: 18 }}>
                  Rp. + {detail.ppnValue.toLocaleString()}
                </Typography>
                <Typography
                  style={{ color: "white", fontSize: 18, marginTop: 25 }}
                >
                  Rp.{" "}
                  {(
                    finalPrice -
                    detail.discountValue -
                    uangMuka +
                    detail.ppnValue
                  ).toLocaleString()}
                </Typography>
              </div>
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default DetailHutang;
