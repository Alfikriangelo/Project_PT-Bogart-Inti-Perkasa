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
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import { toast } from "sonner";
import SignatureCanvas from "react-signature-canvas";
import ClearIcon from "@mui/icons-material/Clear";

const SuratTagihan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();
  const detail = location.state?.detail;
  const [noInvoice, setNoInvoice] = useState("");
  const [alamatPerusahaanTujuan, setAlamatPerusahaanTujuan] = useState("");
  const [noPo, setNoPo] = useState("");
  const [tanggalPo, setTanggalPo] = useState("");
  const [suratJalan, setSuratJalan] = useState("");
  const [terms, setTerms] = useState("");
  const [items, setItems] = useState([
    {
      keteranganBarang: "",
      jumlahBarang: "",
      hargaSatuanBarang: "",
    },
  ]);
  const [uangMuka, setUangMuka] = useState("");
  const [ppn, setPpn] = useState("");
  const [atasNamaRekening, setAtasNamaRekening] = useState("");
  const [namaBank, setNamaBank] = useState("");
  const [noRekening, setNoRekening] = useState("");
  const [tanggalTandaTangan, setTanggalTandaTangan] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [jatuhTempo, setJatuhTempo] = useState("");
  const [penandaTangan, setPenandaTangan] = useState("");
  const namaPerusahaan = detail?.namaperusahaan || "";
  const alamat = detail?.alamat || "";
  const tanggalPoDB = detail?.tanggalPo || "";

  const signatureRef = useRef();
  const calculateTotalPrice = ({ items = [], detail = {} } = {}) => {
    const total =
      (items.length > 0 || Array.isArray(detail.items)) &&
      (items.length > detail.items.length
        ? items
        : [...items, ...detail.items.slice(items.length)]
      ).reduce((acc, item, index) => {
        const hargaSatuan = item.hargaSatuanBarang
          ? item.hargaSatuanBarang
          : (Array.isArray(detail.items) && detail.items[index]?.hargaSatuan) ||
            0;

        const jumlah = item.jumlahBarang
          ? item.jumlahBarang
          : (Array.isArray(detail.items) && detail.items[index]?.jumlah) || 0;

        return acc + hargaSatuan * jumlah;
      }, 0);

    return total;
  };

  const totalPrice = calculateTotalPrice({ items, detail });
  const discountPercentage = detail?.diskon || 0;
  const uangMukaValue = uangMuka * 1;
  const discountValue = (totalPrice * discountPercentage) / 100;
  const ppnValue = (totalPrice * ppn) / 100;
  const finalPrice = totalPrice - discountValue - uangMuka + ppnValue;

  const keteranganBarang = (item, index) =>
    item.keteranganBarang
      ? item.keteranganBarang
      : detail.items[index]?.keterangan || "belum ada data";

  const jumlahBarang = (item, index) =>
    item.jumlahBarang ? item.jumlahBarang : detail.items[index]?.jumlah || 0;

  const hargaSatuanBarang = (item, index) =>
    item.hargaSatuanBarang
      ? item.hargaSatuanBarang.toLocaleString()
      : detail.items[index]?.hargaSatuan?.toLocaleString() || 0;

  const totalHargaBarang = (item, index) =>
    (
      (item.hargaSatuanBarang
        ? item.hargaSatuanBarang
        : detail.items[index]?.hargaSatuan || 0) *
      (item.jumlahBarang ? item.jumlahBarang : detail.items[index]?.jumlah || 0)
    ).toLocaleString();

  const resetForm = () => {
    setNoInvoice("");
    setNoPo("");
    setAlamatPerusahaanTujuan("");
    setSuratJalan("");
    setTerms("");
    setUangMuka("");
    setItems([
      {
        keteranganBarang: "",
        jumlahBarang: "",
        hargaSatuanBarang: "",
      },
    ]);
    setTanggalPo("");
    setPpn("");
    setAtasNamaRekening("");
    setNamaBank("");
    setNoRekening("");
    setTanggalTandaTangan("");
    setLokasi("");
    setJatuhTempo("");
    setPenandaTangan("");
  };

  const handleAddItem = () => {
    const newItem = {
      keteranganBarang: "",
      jumlahBarang: "",
      hargaSatuanBarang: "",
    };

    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    try {
      const combinedItems = [...items, ...detail.items.slice(items.length)];

      const itemsToSubmit = combinedItems.map((item, index) => ({
        keteranganBarang:
          item.keteranganBarang ||
          detail.items[index]?.keterangan ||
          "belum ada data",
        jumlahBarang: item.jumlahBarang || detail.items[index]?.jumlah || 0,
        hargaSatuanBarang:
          item.hargaSatuanBarang || detail.items[index]?.hargaSatuan || 0,
        totalHargaBarang:
          (item.hargaSatuanBarang || detail.items[index]?.hargaSatuan || 0) *
          (item.jumlahBarang || detail.items[index]?.jumlah || 0),
      }));

      await addDoc(collection(db, "piutang"), {
        namaPerusahaan,
        alamat,
        noInvoice,
        alamatPerusahaanTujuan: alamatPerusahaanTujuan || detail.alamat,
        noPo,
        tanggalPo,
        suratJalan,
        terms,
        items: itemsToSubmit,
        uangMuka,
        ppn,
        atasNamaRekening: atasNamaRekening,
        tanggalTandaTangan: tanggalTandaTangan || formatDate(new Date()),
        lokasi: lokasi || "Jakarta",
        discountValue,
        ppnValue,
        finalPrice,
        jatuhTempo,
        penandaTangan: penandaTangan,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "tagihan-pdf"), {
        namaPerusahaan,
        alamat,
        noInvoice,
        alamatPerusahaanTujuan: alamatPerusahaanTujuan || detail.alamat,
        noPo,
        tanggalPo,
        suratJalan,
        terms,
        items: itemsToSubmit,
        uangMuka,
        ppn,
        atasNamaRekening: atasNamaRekening,
        tanggalTandaTangan: tanggalTandaTangan || formatDate(new Date()),
        lokasi: lokasi || "Jakarta",
        discountValue,
        ppnValue,
        finalPrice,
        jatuhTempo,
        penandaTangan: penandaTangan,
        createdAt: serverTimestamp(),
      });

      toast.success("Data Berhasil Ditambahkan");
      resetForm();
    } catch (error) {
      console.log("Error adding document: ", error);
      alert("Gagal menyimpan data.");
    }
  };

  const clearSignature = () => {
    signatureRef.current.clear();
  };

  const handleBackClick = () => {
    if (detail) {
      navigate(`/detail-tagihan/${detail.id}`, {
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const convertToWords = (num) => {
    const units = [
      "",
      "Satu",
      "Dua",
      "Tiga",
      "Empat",
      "Lima",
      "Enam",
      "Tujuh",
      "Delapan",
      "Sembilan",
    ];
    const teens = [
      "Sepuluh",
      "Sebelas",
      "Dua Belas",
      "Tiga Belas",
      "Empat Belas",
      "Lima Belas",
      "Enam Belas",
      "Tujuh Belas",
      "Delapan Belas",
      "Sembilan Belas",
    ];
    const tens = [
      "",
      "",
      "Dua Puluh",
      "Tiga Puluh",
      "Empat Puluh",
      "Lima Puluh",
      "Enam Puluh",
      "Tujuh Puluh",
      "Delapan Puluh",
      "Sembilan Puluh",
    ];
    const thousands = ["", "Ribu", "Juta", "Miliar", "Triliun"];

    if (num === 0) return "Nol";

    let word = "";
    let i = 0;

    while (num > 0) {
      let chunk = num % 1000;
      if (chunk > 0) {
        let chunkWord = "";
        if (chunk % 100 < 20 && chunk % 100 >= 10) {
          chunkWord = teens[chunk % 10];
        } else {
          chunkWord =
            tens[Math.floor(chunk / 10) % 10] +
            (units[chunk % 10] ? " " + units[chunk % 10] : "");
        }
        if (Math.floor(chunk / 100) > 0) {
          chunkWord = units[Math.floor(chunk / 100)] + " Ratus " + chunkWord;
        }
        word = chunkWord + " " + thousands[i] + " " + word;
      }
      num = Math.floor(num / 1000);
      i++;
    }

    return word.trim();
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
    pdf.save(`Surat_Invoice_${detail.namaperusahaan}.pdf`);

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
            Surat Tagihan
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
        style={{
          marginLeft: 50,
          marginRight: 50,
          marginTop: 7,
          marginBottom: 5,
          padding: 25,
          backgroundColor: "white",
          borderColor: "grey",
        }}
      >
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
            label="Alamat Perusahaan Tujuan"
            multiline
            rows={4}
            value={alamatPerusahaanTujuan}
            onChange={(e) => setAlamatPerusahaanTujuan(e.target.value)}
            variant="outlined"
            style={{ width: 300 }}
          />
          <TextField
            id="outlined-multiline-flexible"
            label="No Invoice"
            variant="outlined"
            value={noInvoice}
            onChange={(e) => setNoInvoice(e.target.value)}
            style={{ width: 250 }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            marginTop: 50,
          }}
        >
          <TextField
            id="outlined-multiline-flexible"
            label="No PO"
            variant="outlined"
            value={noPo}
            onChange={(e) => setNoPo(e.target.value)}
            style={{ width: 250 }}
          />
          <TextField
            id="tanggalPO"
            label="Tanggal PO"
            type="date"
            variant="outlined"
            value={tanggalPo}
            onChange={(e) => setTanggalPo(e.target.value)}
            style={{ width: 250 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            id="outlined-basic"
            label="No Surat Jalan"
            variant="outlined"
            value={suratJalan}
            style={{ width: 250 }}
            onChange={(e) => setSuratJalan(e.target.value)}
          />

          <TextField
            id="outlined-basic"
            label="Terms"
            variant="outlined"
            value={terms}
            style={{ width: 250 }}
            onChange={(e) => setTerms(e.target.value)}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            marginTop: 50,
          }}
        >
          {items.map((item, index) => (
            <div key={index} style={{ marginBottom: 15 }}>
              <div>
                <ClearIcon
                  onClick={() => handleRemoveItem(index)}
                  style={{ marginTop: 10 }}
                />
              </div>

              <TextField
                id={`item-${index}-keterangan`}
                label="Nama Barang"
                multiline
                rows={4}
                value={item.keteranganBarang}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index].keteranganBarang = e.target.value;
                  setItems(newItems);
                }}
                style={{ marginTop: 10, marginRight: 10, width: 500 }}
              />

              <TextField
                id={`item-${index}-jumlah`}
                label="Jumlah"
                value={item.jumlahBarang}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index].jumlahBarang = e.target.value;
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
                value={item.hargaSatuanBarang}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index].hargaSatuanBarang =
                    parseFloat(e.target.value) || 0;
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
            </div>
          ))}
        </div>
        <Button
          variant="outlined"
          onClick={handleAddItem}
          style={{ marginTop: 10, textTransform: "none", marginRight: 10 }}
        >
          Tambah Barang
        </Button>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            marginTop: 50,
          }}
        >
          <TextField
            id="outlined-basic"
            label="Uang Muka"
            variant="outlined"
            value={uangMuka}
            style={{ width: 200 }}
            onChange={(e) => setUangMuka(e.target.value)}
          />

          <TextField
            id="outlined-basic"
            label="PPN"
            variant="outlined"
            value={ppn}
            style={{ width: 200 }}
            onChange={(e) => setPpn(e.target.value)}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            marginTop: 50,
          }}
        >
          <TextField
            id="outlined-basic"
            label="Nama Bank"
            variant="outlined"
            value={namaBank}
            style={{ width: 200 }}
            onChange={(e) => setNamaBank(e.target.value)}
          />
          <TextField
            id="outlined-basic"
            label="Atas Nama"
            variant="outlined"
            value={atasNamaRekening}
            style={{ width: 200 }}
            onChange={(e) => setAtasNamaRekening(e.target.value)}
          />
          <TextField
            id="outlined-basic"
            label="No Rekening"
            variant="outlined"
            value={noRekening}
            style={{ width: 200 }}
            onChange={(e) => setNoRekening(e.target.value)}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            marginTop: 50,
          }}
        >
          <TextField
            id="outlined-basic"
            label="Lokasi"
            variant="outlined"
            value={lokasi}
            style={{ width: 200 }}
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
            onChange={(e) => setPenandaTangan(e.target.value)}
            style={{ width: 250 }}
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
            Data Piutang
          </Typography>
          <Typography style={{ marginBottom: 20, fontSize: 18 }}>
            Gunakan form ini jika anda ingin menambahkan data untuk halaman
            piutang
          </Typography>
          <TextField
            id="jatuhTempo"
            label="Tanggal Jatuh Tempo"
            type="date"
            variant="outlined"
            value={jatuhTempo}
            onChange={(e) => setJatuhTempo(e.target.value)}
            style={{ width: 250 }}
            InputLabelProps={{ shrink: true }}
          />
        </div>
      </Paper>
      <Paper
        elevation={3}
        style={{ padding: 50, boxShadow: "none" }}
        ref={printRef}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <Typography
              style={{
                fontWeight: "bold",
                fontSize: 48,
              }}
            >
              PT. BOGART INTI PERKASA
            </Typography>
            <Typography style={{ fontSize: 18 }}>
              Komplek Rukan Malibu City Resort Blok I Cengkareng Timur,
            </Typography>
            <Typography style={{ fontSize: 18 }}>
              Cengkareng, Kota Adm, Jakarta Barat, DKI Jakarta
            </Typography>
            <Typography style={{ fontSize: 18 }}>
              Telp:083807820668 / 081285850251; Email: marketing.bip45@gmail.com
            </Typography>
          </div>
          <div style={{ textAlign: "center" }}>
            <Typography
              style={{
                fontWeight: "bold",
                fontSize: 48,
              }}
            >
              INVOICE
            </Typography>
            <Typography>
              {noInvoice ? (
                noInvoice
              ) : (
                <Typography style={{ color: "red", fontSize: 18 }}>
                  No Invoice Belum diisi
                </Typography>
              )}
            </Typography>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 50,
          }}
        >
          <div>
            <Typography style={{ fontSize: 20 }}>Kepada Yth</Typography>
            <Typography style={{ fontSize: 20 }}>{namaPerusahaan}</Typography>
            <Typography style={{ fontSize: 20, maxWidth: 500 }}>
              {alamat}
            </Typography>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Typography style={{ fontSize: 20 }}>No. PO </Typography>

              {noPo ? (
                <Typography style={{ fontSize: 20 }}>: {noPo}</Typography>
              ) : (
                <Typography style={{ color: "red", fontSize: 20 }}>
                  : No PO Belum diisi
                </Typography>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Typography style={{ fontSize: 20 }}>Tanggal PO</Typography>
              {tanggalPo ? (
                <Typography style={{ fontSize: 20 }}>
                  : {formatDate(tanggalPo)}
                </Typography>
              ) : tanggalPoDB ? (
                <Typography style={{ fontSize: 20 }}>
                  : {formatDate(tanggalPoDB)}
                </Typography>
              ) : (
                <Typography style={{ color: "red", fontSize: 20 }}>
                  : Tgl. PO Belum diisi
                </Typography>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Typography style={{ fontSize: 20 }}>Surat Jalan</Typography>
              {suratJalan ? (
                <Typography style={{ fontSize: 20 }}>: {suratJalan}</Typography>
              ) : (
                <Typography style={{ color: "red", fontSize: 20 }}>
                  : Surat Jalan Belum diisi
                </Typography>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Typography style={{ fontSize: 20 }}>Terms</Typography>
              {terms ? (
                <Typography style={{ fontSize: 20 }}>: {terms}</Typography>
              ) : (
                <Typography style={{ color: "red", fontSize: 20 }}>
                  : Terms Belum diisi
                </Typography>
              )}
            </div>
          </div>
        </div>

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
                  Nama Barang
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
              {(items.length > 0 || Array.isArray(detail.items)) &&
                (items.length > detail.items.length
                  ? items
                  : [...items, ...detail.items.slice(items.length)]
                ).map((item, index) => (
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
                      {keteranganBarang(item, index)}
                    </TableCell>
                    <TableCell
                      style={{
                        border: "1px solid #ddd",
                        fontSize: 18,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      {jumlahBarang(item, index)}
                    </TableCell>
                    <TableCell
                      style={{
                        border: "1px solid #ddd",
                        fontSize: 18,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      Rp{hargaSatuanBarang(item, index)}
                    </TableCell>
                    <TableCell
                      style={{
                        border: "1px solid #ddd",
                        fontSize: 18,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      Rp{totalHargaBarang(item, index)}
                    </TableCell>
                  </TableRow>
                ))}
              {items.length === 0 && (
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
            </TableBody>

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
                Rp{totalPrice.toLocaleString()}
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
                  Rp{uangMukaValue.toLocaleString()}
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
                Rp{discountValue.toLocaleString()}
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
                    backgroundColor: "#FFFFFF",
                    fontSize: 18,
                  }}
                >
                  PPN({ppn})%
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    fontSize: 18,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  Rp{ppnValue.toLocaleString()}
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
                Rp{finalPrice.toLocaleString()}
              </TableCell>
            </TableRow>
          </Table>
        </TableContainer>

        <div style={{ marginTop: 10 }}>
          <Typography style={{ fontWeight: "bold", fontSize: 18 }}>
            Terbilang: {convertToWords(finalPrice)} Rupiah
          </Typography>
        </div>

        <div style={{ marginTop: 50 }}>
          <Typography style={{ fontSize: 18 }}>
            *Barang yang sudah dibeli tidak bisa ditukar/dikembalikan
          </Typography>
          <Typography style={{ fontSize: 18 }}>
            *Pembayaran harap ditransfer ke:
          </Typography>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Typography
                style={{
                  fontSize: 18,
                  border: "1px solid #ddd",
                  padding: 10,
                  width: 150,
                }}
              >
                Atas Nama
              </Typography>

              <Typography
                style={{
                  fontSize: 18,
                  border: "1px solid #ddd",
                  padding: 10,
                  width: 400,
                }}
              >
                {atasNamaRekening ? (
                  atasNamaRekening
                ) : (
                  <Typography style={{ fontSize: 18, color: "red" }}>
                    Atas nama rekekning belum ditambahkan
                  </Typography>
                )}
              </Typography>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <Typography
                style={{
                  fontSize: 18,
                  border: "1px solid #ddd",
                  padding: 10,
                  width: 150,
                }}
              >
                Bank {namaBank ? namaBank : "BTPN"}
              </Typography>

              <Typography
                style={{
                  fontSize: 18,
                  border: "1px solid #ddd",
                  padding: 10,
                  width: 400,
                }}
              >
                {noRekening ? (
                  noRekening
                ) : (
                  <Typography style={{ fontSize: 18, color: "red" }}>
                    No rekening belum ditambahkan
                  </Typography>
                )}
              </Typography>
            </div>

            <Typography style={{ fontSize: 18, marginTop: 10 }}>
              *Harap mencantumkan nomor invoice saat melakukan transfer
            </Typography>
          </div>

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
                justifyContent: "center",
              }}
            >
              <Typography style={{ fontSize: 18 }}>
                {lokasi ? lokasi : "Jakarta"},
              </Typography>

              <Typography style={{ fontSize: 18 }}>
                {tanggalTandaTangan ? (
                  <Typography style={{ fontSize: 20, marginLeft: 5 }}>
                    {formatDate(tanggalTandaTangan)}
                  </Typography>
                ) : (
                  <Typography style={{ fontSize: 18, marginLeft: 5 }}>
                    {formatDate(new Date())}
                  </Typography>
                )}
              </Typography>
            </div>

            <Typography style={{ fontSize: 18 }}>
              PT. BOGART INTI PERKASA
            </Typography>
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 450,
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
            <Typography style={{ fontSize: 18 }}>
              {penandaTangan ? (
                penandaTangan
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

export default SuratTagihan;
