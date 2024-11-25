import React, { useRef, useState } from "react";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
  TextField,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { BiruAktif } from "../../../Colors";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SignatureCanvas from "react-signature-canvas";
import {
  collection,
  addDoc,
  getDocs,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { toast } from "sonner";
import { updatePassword } from "firebase/auth";

const SuratPo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();
  const [suratNo, setSuratNo] = useState("");
  const [kepada, setKepada] = useState("");
  const [up, setUp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [tanggalPO, setTanggalPO] = useState("");
  const [tanggalTandaTangan, setTanggalTandaTangan] = useState("");
  const [penandaTangan, setPenandaTangan] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [uangMuka, setUangMuka] = useState("");
  const [ppn, setPpn] = useState("");
  const [items, setItems] = useState([
    {
      keterangan: "",
      jumlah: "",
      hargaSatuan: "",
    },
  ]);
  const [tanggalPembayaran, setTanggalPembayaran] = useState("");
  const [jatuhTempo, setJatuhTempo] = useState("");
  const signatureRef = useRef();

  const detail = location.state?.detail;

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
  const ppnValue = (ppn / 100) * totalPrice;
  const finalPrice = totalPrice - uangMuka - discountValue + ppnValue;

  const totalHargaBarang = (item, index) =>
    (
      (item.hargaSatuanBarang
        ? item.hargaSatuanBarang
        : detail.items[index]?.hargaSatuan || 0) *
      (item.jumlahBarang ? item.jumlahBarang : detail.items[index]?.jumlah || 0)
    ).toLocaleString();

  const resetForm = () => {
    setSuratNo("");
    setKepada("");
    setUp("");
    setAlamat("");
    setTanggalPO("");
    setTanggalTandaTangan("");
    setPenandaTangan("");
    setLokasi("");
    setUangMuka("");
    setPpn("");
    setTanggalPembayaran("");
    setJatuhTempo("");
    setItems([
      {
        keterangan: "",
        jumlah: "",
        hargaSatuan: "",
      },
    ]);
  };

  const handleSubmit = async (event) => {
    try {
      const combinedItems = [...items, ...detail.items.slice(items.length)];

      const itemsToSubmit = combinedItems.map((item, index) => ({
        keterangan:
          item.keterangan ||
          detail.items[index]?.keterangan ||
          "belum ada data",
        jumlah: item.jumlah || detail.items[index]?.jumlah || 0,
        hargaSatuan: item.hargaSatuan || detail.items[index]?.hargaSatuan || 0,
        totalHarga:
          (item.hargaSatuan || detail.items[index]?.hargaSatuan || 0) *
          (item.jumlah || detail.items[index]?.jumlah || 0),
      }));

      await addDoc(collection(db, "po"), {
        suratNo,
        kepada: kepada || detail.namaperusahaan,
        up: up || detail.attn,
        alamat: alamat || detail.alamat,
        tanggalPO: tanggalPO || detail.tanggal,
        items: itemsToSubmit,
        tanggalTandaTangan: tanggalTandaTangan || formatDate(new Date()),
        penandaTangan,
        lokasi,
        uangMuka,
        ppn,
        ppnValue: ppnValue,
        discountValue: discountValue,
        finalPrice: finalPrice,
        jatuhTempo,
        tanggalPembayaran,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "po-pdf"), {
        suratNo,
        kepada: kepada || detail.namaperusahaan,
        up: up || detail.attn,
        alamat: alamat || detail.alamat,
        tanggalPO: tanggalPO || detail.tanggal,
        items: itemsToSubmit,
        tanggalTandaTangan: tanggalTandaTangan || formatDate(new Date()),
        penandaTangan,
        lokasi,
        uangMuka,
        ppn,
        ppnValue: ppnValue,
        discountValue: discountValue,
        finalPrice: finalPrice,
        jatuhTempo,
        tanggalPembayaran,
        createdAt: serverTimestamp(),
      });

      toast.success("PO created successfully");
      resetForm();
    } catch (error) {
      console.error("Error menambahkan dokumen: ", error);
      alert("Gagal menyimpan data.");
    }
  };

  const clearSignature = () => {
    signatureRef.current.clear();
  };

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

  const handleDownloadPDF = async () => {
    await handleSubmit();

    const element = printRef.current;

    element.style.fontSize = "50px";

    const buttonToHide = document.getElementById("hapusTandaTanganButton");
    if (buttonToHide) {
      buttonToHide.style.display = "none";
    }

    const canvas = await html2canvas(element, {
      backgroundColor: "#FFFFFF",
      useCORS: true,
    });

    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Surat_Purchase Order_${detail.namaperusahaan}.pdf`);

    element.style.fontSize = "";

    if (buttonToHide) {
      buttonToHide.style.display = "block";
    }
  };

  return (
    <div style={{ width: "100vw", height: "100%", backgroundColor: "white" }}>
      <AppBar
        position="static"
        elevation={0}
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
            Surat Purchase Order
          </Typography>

          <IconButton onClick={handleDownloadPDF}>
            <Typography style={{ color: BiruAktif, marginRight: 10 }}>
              Download
            </Typography>
            <FileDownloadIcon style={{ color: BiruAktif }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} style={{ margin: 50, padding: 25, marginBottom: 5 }}>
        <Typography
          style={{
            color: BiruAktif,
            fontWeight: "bold",
            fontSize: 28,
          }}
        >
          Data Tambahan
        </Typography>
        <Typography style={{ marginBottom: 20, fontSize: 18 }}>
          Gunakan form ini jika anda ingin mengubah atau menambahkan data pada
          surat
        </Typography>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <TextField
            id="outlined-multiline-flexible"
            label="Alamat"
            multiline
            rows={4}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            variant="outlined"
            style={{ width: "30%" }}
          />
          <TextField
            id="outlined-multiline-flexible"
            label="Kepada"
            variant="outlined"
            value={kepada}
            onChange={(e) => setKepada(e.target.value)}
            style={{ width: 250 }}
          />
          <TextField
            id="outlined-multiline-flexible"
            label="Up"
            variant="outlined"
            value={up}
            onChange={(e) => setUp(e.target.value)}
            style={{ width: 250 }}
          />

          <TextField
            id="outlined-basic"
            label="No surat"
            variant="outlined"
            value={suratNo}
            style={{ width: 250 }}
            onChange={(e) => setSuratNo(e.target.value)}
          />
          <TextField
            id="tanggalPO"
            label="Tanggal PO"
            type="date"
            variant="outlined"
            value={tanggalPO}
            onChange={(e) => setTanggalPO(e.target.value)}
            style={{ width: 250 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            id="uangMuka"
            label="Uang Muka"
            variant="outlined"
            value={uangMuka}
            style={{ width: 250 }}
            onChange={(e) => setUangMuka(e.target.value)}
          />
          <TextField
            id="ppn"
            label="PPN"
            variant="outlined"
            value={ppn}
            style={{ width: 250 }}
            onChange={(e) => setPpn(e.target.value)}
          />
          <TextField
            id="lokasi"
            label="Lokasi"
            variant="outlined"
            value={lokasi}
            style={{ width: 250 }}
            onChange={(e) => setLokasi(e.target.value)}
          />
          <TextField
            id="tanggalTandaTangan"
            label="Tanggal Tanda Tangan"
            type="date"
            variant="outlined"
            value={tanggalTandaTangan}
            onChange={(e) => setTanggalTandaTangan(e.target.value)}
            style={{ width: 250 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            id="penandaTangan"
            label="Penanda Tangan"
            variant="outlined"
            value={penandaTangan}
            style={{ width: 250 }}
            onChange={(e) => setPenandaTangan(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 25, marginBottom: 50 }}>
          <Typography
            style={{
              color: BiruAktif,
              fontWeight: "bold",
              fontSize: 28,
            }}
          >
            Data Hutang
          </Typography>
          <Typography style={{ marginBottom: 20, fontSize: 18 }}>
            Gunakan form ini jika anda ingin menambahkan data untuk halaman
            hutang
          </Typography>

          <TextField
            id="tanggalPembayaran"
            label="Tanggal Pembayaran"
            variant="outlined"
            type="date"
            value={tanggalPembayaran}
            style={{ width: 250 }}
            onChange={(e) => setTanggalPembayaran(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            id="jatuhTempo"
            label="Jatuh Tempo"
            variant="outlined"
            type="date"
            value={jatuhTempo}
            style={{ width: 250, marginLeft: 20 }}
            onChange={(e) => setJatuhTempo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </div>
      </Paper>
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

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
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
        </div>

        <div
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography style={{ fontWeight: "bold" }}>PURCHASE ORDER</Typography>
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
                    Kepada
                  </Typography>
                  <Typography style={{ fontSize: 18 }}>
                    : {kepada ? kepada : detail.namaperusahaan}
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
                    Up
                  </Typography>
                  <Typography style={{ fontSize: 18 }}>
                    : {up ? up : detail.attn}
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
                    Alamat
                  </Typography>
                  <Typography style={{ fontSize: 18, maxWidth: 500 }}>
                    : {alamat ? alamat : detail.alamat}
                  </Typography>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Typography
                    style={{ fontWeight: "bold", minWidth: 100, fontSize: 18 }}
                  >
                    Po No
                  </Typography>
                  {suratNo ? (
                    <Typography>: {suratNo}</Typography>
                  ) : (
                    <Typography style={{ color: " red" }}>
                      : No surat belum ditambahkan
                    </Typography>
                  )}
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
                    Tanggal
                  </Typography>
                  <Typography style={{ fontSize: 18 }}>
                    {tanggalPO ? (
                      <Typography>: {formatDate(tanggalPO)}</Typography>
                    ) : (
                      <Typography>: {formatDate(detail.tanggal)}</Typography>
                    )}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Typography style={{ fontSize: 18 }}>Tidak ada data!</Typography>
        )}
        <TableContainer
          component={Paper}
          style={{ marginTop: "20px", backgroundColor: "#FFFFFF" }}
        >
          <Table aria-simple="simple table">
            <TableHead>
              <TableRow>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    fontSize: 18,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  No
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    fontSize: 18,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  Keterangan
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    fontSize: 18,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  Jumlah
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    fontSize: 18,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  Harga Satuan
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    fontSize: 18,
                    backgroundColor: "#FFFFFF",
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
                      style={{
                        border: "1px solid #ddd",
                        fontSize: 18,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell
                      style={{
                        border: "1px solid #ddd",
                        fontSize: 18,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      {item.keterangan}
                    </TableCell>
                    <TableCell
                      style={{
                        border: "1px solid #ddd",
                        fontSize: 18,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      {item.jumlah}
                    </TableCell>
                    <TableCell
                      style={{
                        border: "1px solid #ddd",
                        fontSize: 18,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      {formatToIDR(item.hargaSatuan)}
                    </TableCell>
                    <TableCell
                      style={{
                        border: "1px solid #ddd",
                        fontSize: 18,
                        backgroundColor: "#FFFFFF",
                      }}
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
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    Data tidak tersedia.
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell
                  style={{
                    border: "1px solid #ddd",
                    backgroundColor: "#FFFFFF",
                  }}
                ></TableCell>
                <TableCell
                  style={{
                    border: "1px solid #ddd",
                    backgroundColor: "#FFFFFF",
                  }}
                ></TableCell>
                <TableCell
                  style={{
                    border: "1px solid #ddd",
                    backgroundColor: "#FFFFFF",
                  }}
                ></TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    fontSize: 18,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  Jumlah
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    fontSize: 18,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  {formatToIDR(totalPrice)}
                </TableCell>
              </TableRow>
              {uangMuka > 0 && (
                <TableRow>
                  <TableCell
                    style={{
                      border: "1px solid #ddd",
                      backgroundColor: "#FFFFFF",
                    }}
                  ></TableCell>
                  <TableCell
                    style={{
                      border: "1px solid #ddd",
                      backgroundColor: "#FFFFFF",
                    }}
                  ></TableCell>
                  <TableCell
                    style={{
                      border: "1px solid #ddd",
                      backgroundColor: "#FFFFFF",
                    }}
                  ></TableCell>
                  <TableCell
                    style={{
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                      fontSize: 18,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    Uang Muka
                  </TableCell>
                  <TableCell
                    style={{
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                      fontSize: 18,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    {formatToIDR(uangMuka)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell
                  style={{
                    border: "1px solid #ddd",
                    backgroundColor: "#FFFFFF",
                  }}
                ></TableCell>
                <TableCell
                  style={{
                    border: "1px solid #ddd",
                    backgroundColor: "#FFFFFF",
                  }}
                ></TableCell>
                <TableCell
                  style={{
                    border: "1px solid #ddd",
                    backgroundColor: "#FFFFFF",
                  }}
                ></TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    fontSize: 18,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  Disc({discountPercentage}%)
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    fontSize: 18,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  {formatToIDR(discountValue)}
                </TableCell>
              </TableRow>
              {ppn > 0 && (
                <TableRow>
                  <TableCell
                    style={{
                      border: "1px solid #ddd",
                      backgroundColor: "#FFFFFF",
                    }}
                  ></TableCell>
                  <TableCell
                    style={{
                      border: "1px solid #ddd",
                      backgroundColor: "#FFFFFF",
                    }}
                  ></TableCell>
                  <TableCell
                    style={{
                      border: "1px solid #ddd",
                      backgroundColor: "#FFFFFF",
                    }}
                  ></TableCell>
                  <TableCell
                    style={{
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                      fontSize: 18,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    PPN({ppn}%)
                  </TableCell>
                  <TableCell
                    style={{
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                      fontSize: 18,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    {formatToIDR(ppnValue)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell
                  style={{
                    border: "1px solid #ddd",
                    backgroundColor: "#FFFFFF",
                  }}
                ></TableCell>
                <TableCell
                  style={{
                    border: "1px solid #ddd",
                    backgroundColor: "#FFFFFF",
                  }}
                ></TableCell>
                <TableCell
                  style={{
                    border: "1px solid #ddd",
                    backgroundColor: "#FFFFFF",
                  }}
                ></TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    color: BiruAktif,
                    fontSize: 18,
                    backgroundColor: "#FFFFFF",
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
                    backgroundColor: "#FFFFFF",
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
            alignItems: "center",
            justifyContent: "center",
            marginTop: 40,
            marginLeft: 100,
            width: "20%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                textAlign: "center",
                justifyContent: "center",
              }}
            >
              {lokasi ? (
                <Typography style={{ fontSize: 18 }}>{lokasi}, </Typography>
              ) : (
                <Typography color="red">Lokasi Belum ditambahkan</Typography>
              )}

              {tanggalTandaTangan ? (
                <Typography style={{ marginLeft: 5, fontSize: 18 }}>
                  {formatDate(tanggalTandaTangan)}
                </Typography>
              ) : (
                <Typography style={{ marginLeft: 5, fontSize: 18 }}>
                  {formatDate(new Date())}
                </Typography>
              )}
            </div>
            <Typography style={{ fontSize: 18 }}>
              Bogart Inti Perkasa
            </Typography>

            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 400,
                height: 200,
                className: "signature-canvas",
              }}
            />

            <Button
              id="hapusTandaTanganButton"
              className="red-button"
              onClick={clearSignature}
              style={{ textTransform: "none" }}
            >
              Hapus Tanda Tangan
            </Button>

            <Typography>
              {penandaTangan ? (
                <Typography style={{ fontSize: 18 }}>
                  {penandaTangan}
                </Typography>
              ) : (
                <Typography style={{ fontSize: 18, color: "red" }}>
                  Penanda tangan belum ditambahkan
                </Typography>
              )}
            </Typography>
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default SuratPo;
