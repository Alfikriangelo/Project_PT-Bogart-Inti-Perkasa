import {
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
} from "@mui/material";
import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BiruAktif } from "../../../Colors";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const SuratPenawaran = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();

  const detail = location.state?.detail;

  const handleBackClick = () => {
    if (detail) {
      navigate(`/detail-penawaran/${detail.id}`, {
        state: { detail },
      });
    } else {
      console.log("No detail found!");
    }
  };

  const formatToIDR = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

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
    const day = date.getDate();
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

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Surat_Penawaran_${detail.namaperusahaan}.pdf`);
  };
  return (
    <div style={{ width: "100vw", height: "100%" }}>
      <AppBar
        position="static"
        sx={{ width: "100vw", backgroundColor: "white" }}
      >
        <Toolbar
          variant="dense"
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={handleBackClick}
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
            Surat Penawaran
          </Typography>

          <IconButton onClick={handleDownloadPDF}>
            <Typography style={{ color: BiruAktif, marginRight: 10 }}>
              Download
            </Typography>
            <FileDownloadIcon style={{ color: BiruAktif }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Paper
        elevation={3}
        style={{ padding: 50, boxShadow: "none" }}
        ref={printRef}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            style={{
              color: BiruAktif,
              fontWeight: "bold",
              fontSize: 48,
            }}
          >
            PT. BOGART INTI PERKASA
          </Typography>
          <Typography style={{ fontSize: 18 }}>
            Komplek Rukan Malibu City Resort Blok I No. 11
          </Typography>
          <Typography style={{ fontSize: 18 }}>
            Jalan Kamal Raya Outer Ring Road Cengkareng Timur, Jakarta Barat
            1171
          </Typography>
          <Typography style={{ fontSize: 18 }}>
            Email: marketing.bip45@gmail.com Telp:083807820668 / 081285850251
          </Typography>
        </div>

        {detail ? (
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 20,
                marginTop: 40,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Typography
                    style={{ fontWeight: "bold", minWidth: 100, fontSize: 18 }}
                  >
                    To
                  </Typography>
                  <Typography style={{ fontSize: 18 }}>
                    : {detail.namaperusahaan}
                  </Typography>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Typography
                    style={{ fontWeight: "bold", minWidth: 100, fontSize: 18 }}
                  >
                    Attn
                  </Typography>
                  <Typography style={{ fontSize: 18 }}>
                    : {detail.attn}
                  </Typography>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Typography
                    style={{ fontWeight: "bold", minWidth: 100, fontSize: 18 }}
                  >
                    Project
                  </Typography>
                  <Typography style={{ fontSize: 18 }}>
                    : {detail.project}
                  </Typography>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Typography
                    style={{ fontWeight: "bold", minWidth: 100, fontSize: 18 }}
                  >
                    Email
                  </Typography>
                  <Typography style={{ fontSize: 18 }}>
                    : {detail.email}
                  </Typography>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Typography
                    style={{ fontWeight: "bold", minWidth: 100, fontSize: 18 }}
                  >
                    Telp
                  </Typography>
                  <Typography style={{ fontSize: 18 }}>
                    : {detail.telepon}
                  </Typography>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Typography
                    style={{ fontWeight: "bold", minWidth: 100, fontSize: 18 }}
                  >
                    Quo No
                  </Typography>
                  <Typography style={{ fontSize: 18 }}>
                    : {detail.quoNo}
                  </Typography>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    fontSize: 18,
                  }}
                >
                  <Typography
                    style={{ fontWeight: "bold", minWidth: 100, fontSize: 18 }}
                  >
                    Date
                  </Typography>
                  <Typography style={{ fontSize: 18 }}>
                    : {formatDate(detail.tanggal)}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Table for Detail Penawaran */}
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        border: "1px solid #ddd",
                        fontSize: 18,
                      }}
                    >
                      No
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        border: "1px solid #ddd",
                        fontSize: 18,
                      }}
                    >
                      Keterangan
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        border: "1px solid #ddd",
                        fontSize: 18,
                      }}
                    >
                      Jumlah
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        border: "1px solid #ddd",
                        fontSize: 18,
                      }}
                    >
                      Harga Satuan
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        border: "1px solid #ddd",
                        fontSize: 18,
                      }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(detail.items) ? (
                    detail.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell
                          style={{ border: "1px solid #ddd", fontSize: 18 }}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell
                          style={{ border: "1px solid #ddd", fontSize: 18 }}
                        >
                          {item.keterangan}
                        </TableCell>
                        <TableCell
                          style={{ border: "1px solid #ddd", fontSize: 18 }}
                        >
                          {item.jumlah}
                        </TableCell>
                        <TableCell
                          style={{ border: "1px solid #ddd", fontSize: 18 }}
                        >
                          {formatToIDR(item.hargaSatuan)}
                        </TableCell>
                        <TableCell
                          style={{ border: "1px solid #ddd", fontSize: 18 }}
                        >
                          {formatToIDR(item.jumlah * item.hargaSatuan)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          border: "1px solid #ddd",
                        }}
                      >
                        Data tidak tersedia.
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell style={{ border: "1px solid #ddd" }}></TableCell>
                    <TableCell style={{ border: "1px solid #ddd" }}></TableCell>
                    <TableCell style={{ border: "1px solid #ddd" }}></TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        border: "1px solid #ddd",
                        fontSize: 18,
                      }}
                    >
                      Jumlah
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        border: "1px solid #ddd",
                        fontSize: 18,
                      }}
                    >
                      {formatToIDR(totalPrice)}
                    </TableCell>
                  </TableRow>
                  {discountPercentage > 0 && (
                    <TableRow>
                      <TableCell
                        style={{ border: "1px solid #ddd" }}
                      ></TableCell>
                      <TableCell
                        style={{ border: "1px solid #ddd" }}
                      ></TableCell>
                      <TableCell
                        style={{ border: "1px solid #ddd" }}
                      ></TableCell>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          border: "1px solid #ddd",
                          fontSize: 18,
                        }}
                      >
                        Disc({discountPercentage}%)
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          border: "1px solid #ddd",
                          fontSize: 18,
                        }}
                      >
                        {formatToIDR(discountValue)}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell style={{ border: "1px solid #ddd" }}></TableCell>
                    <TableCell style={{ border: "1px solid #ddd" }}></TableCell>
                    <TableCell style={{ border: "1px solid #ddd" }}></TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        border: "1px solid #ddd",
                        color: BiruAktif,
                        fontSize: 18,
                      }}
                    >
                      Total
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        border: "1px solid #ddd",
                        color: BiruAktif,
                        fontSize: 18,
                      }}
                    >
                      {formatToIDR(finalPrice)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 20,
              }}
            >
              <div style={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  style={{ fontWeight: "bold", minWidth: 100, fontSize: 18 }}
                >
                  Price
                </Typography>
                <Typography style={{ fontSize: 18 }}>
                  : {detail.keteranganHarga}
                </Typography>
              </div>

              <div style={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  style={{ fontWeight: "bold", minWidth: 100, fontSize: 18 }}
                >
                  Validity
                </Typography>
                <Typography style={{ fontSize: 18 }}>
                  : {detail.validitas}
                </Typography>
              </div>

              <div style={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  style={{ fontWeight: "bold", minWidth: 100, fontSize: 18 }}
                >
                  Delivery
                </Typography>
                <Typography style={{ fontSize: 18 }}>
                  : {detail.pengiriman}
                </Typography>
              </div>

              <div style={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  style={{ fontWeight: "bold", minWidth: 100, fontSize: 18 }}
                >
                  Payment
                </Typography>
                <Typography style={{ fontSize: 18 }}>
                  : {detail.pembayaran}
                </Typography>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <Typography style={{ fontSize: 18 }}>Best Regads.</Typography>
              <Typography style={{ fontSize: 18 }}>
                PT. BOGART INTI PERKASA
              </Typography>
            </div>

            <div
              style={{
                marginTop: 40,
                flex: "diplay",
                flexDirection: "column",
              }}
            >
              <Typography style={{ fontSize: 18 }}>Dwi Kuswari</Typography>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <WhatsAppIcon style={{ marginRight: 20, color: "#29AF3E" }} />
                <Typography style={{ fontSize: 18 }}>: 083807820668</Typography>
              </div>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <EmailIcon style={{ marginRight: 20 }} />
                <Typography style={{ fontSize: 18 }}>
                  : marketing.bip45@gmail.com
                </Typography>
              </div>
            </div>
          </div>
        ) : (
          <Typography style={{ fontSize: 18 }}>Tidak ada data!</Typography>
        )}
      </Paper>
    </div>
  );
};

export default SuratPenawaran;
