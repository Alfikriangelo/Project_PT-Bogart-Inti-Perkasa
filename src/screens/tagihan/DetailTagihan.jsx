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
import { BiruAktif, BiruDonker, putihKomponen } from "../../Colors";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const DetailTagihan = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const formatToIDR = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  useEffect(() => {
    if (location.state?.detail) {
      setDetail(location.state.detail);
    } else {
      const fetchDetail = async () => {
        try {
          const db = getFirestore();
          const docRef = doc(db, "tagihan", id);
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
          onClick={() => navigate("/tagihan")}
        >
          Kembali
        </Button>
      </div>
    );
  }

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

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "white" }}>
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
            onClick={() => navigate("/tagihan")}
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
            Detail Tagihan
          </Typography>
        </Toolbar>
      </AppBar>

      <div
        style={{
          margin: 100,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={1}
          style={{
            padding: 50,
            borderRadius: "15px 0px 0px 15px",
            backgroundColor: putihKomponen,
          }}
        >
          <div style={{ marginRight: 200 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {detail.quoNo}
              </Typography>
              <Typography variant="body1">{detail.tanggal}</Typography>
            </div>

            <div
              style={{
                marginTop: 25,
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {detail.perusahaan}
              </Typography>
              <Typography variant="body1" style={{ maxWidth: 500 }}>
                {detail.alamat}
              </Typography>
            </div>
            <div style={{ marginTop: 50 }}>
              <Button
                style={{ textTransform: "none", marginRight: 25 }}
                variant="outlined"
                onClick={() =>
                  navigate("/surat-tagihan", { state: { detail } })
                }
              >
                Tagihan
              </Button>
              <Button
                style={{ textTransform: "none" }}
                variant="outlined"
                onClick={() => navigate("/surat-jalan", { state: { detail } })}
              >
                Jalan
              </Button>
            </div>
          </div>
        </Paper>
        <Paper
          elevation={1}
          style={{
            padding: 50,
            borderRadius: "0px 15px 15px 0px",
            backgroundColor: BiruDonker,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "50px",
              }}
            >
              {Array.isArray(detail.items) ? (
                detail.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: 300,
                      }}
                    >
                      <Typography variant="body1" style={{ color: "white" }}>
                        Keterangan
                      </Typography>
                      <Typography variant="body1" style={{ color: "white" }}>
                        {item.keterangan}
                      </Typography>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "300px",
                      }}
                    >
                      <Typography variant="body1" style={{ color: "white" }}>
                        Jumlah
                      </Typography>
                      <Typography variant="body1" style={{ color: "white" }}>
                        x{item.jumlah}
                      </Typography>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "300px",
                      }}
                    >
                      <Typography variant="body1 " style={{ color: "white" }}>
                        Harga
                      </Typography>
                      <Typography variant="body1" style={{ color: "white" }}>
                        {formatToIDR(item.hargaSatuan)}
                      </Typography>
                    </div>
                  </div>
                ))
              ) : (
                <Typography variant="body1" style={{ color: "white" }}>
                  {detail.keterangan}
                </Typography>
              )}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography style={{ fontWeight: "bold", color: "white" }}>
                    Jumlah
                  </Typography>
                  <Typography style={{ fontWeight: "bold", color: "white" }}>
                    {formatToIDR(totalPrice)}
                  </Typography>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography style={{ fontWeight: "bold", color: "white" }}>
                    Diskon
                  </Typography>
                  <Typography style={{ fontWeight: "bold", color: "white" }}>
                    {discountPercentage}%
                  </Typography>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography style={{ fontWeight: "bold", color: "white" }}>
                    Total
                  </Typography>
                  <Typography style={{ fontWeight: "bold", color: "white" }}>
                    {formatToIDR(finalPrice)}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default DetailTagihan;