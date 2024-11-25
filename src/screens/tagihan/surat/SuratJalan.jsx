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
import { set } from "firebase/database";

const SuratJalan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();
  const detail = location.state?.detail;
  const [noSuratJalan, setNoSuratJalan] = useState("");
  const [poCustomer, setPoCustomer] = useState("");
  const [tanggalSurat, setTanggalSurat] = useState("");
  const [tanggalPo, setTanggalPo] = useState("");
  const [alamatKirim, setAlamatKirim] = useState("");
  const [up, setUp] = useState("");
  const [penerima, setPenerima] = useState("");
  const [penandaTangan, setPenandaTangan] = useState("");
  const [items, setItems] = useState([
    {
      namaBarang: "",
      JumlahBarang: "",
    },
  ]);

  const signatureRefSatu = useRef();
  const signatureRefDua = useRef();

  const resetForm = () => {
    setNoSuratJalan("");
    setPoCustomer("");
    setTanggalSurat("");
    setTanggalPo("");
    setAlamatKirim("");
    setUp("");
    setPenerima("");
    setPenandaTangan("");
    setItems([
      {
        namaBarang: "",
        jumlahBarang: "",
      },
    ]);
  };

  const handleAddItem = () => {
    setItems([...items, { namaBarang: "", JumlahBarang: "" }]);
  };
  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    try {
      const combinedItems = [...items, ...detail.items.slice(items.length)];

      const itemsToSubmit = combinedItems.map((item, index) => ({
        namaBarang:
          item.keteranganBarang ||
          detail.items[index]?.keterangan ||
          "belum ada data",
        jumlahBarang: item.jumlahBarang || detail.items[index]?.jumlah || 0,
      }));

      await addDoc(collection(db, "surat-jalan"), {
        namaperusahaan: detail.namaperusahaan,
        alamatperusahaan: detail.alamat,
        noSuratJalan,
        tanggalSurat: tanggalSurat || formatDate(new Date()),
        poCustomer,
        tanggalPo,
        alamatKirim,
        up,
        penerima,
        items: itemsToSubmit,
        penandaTangan,
        createdAt: serverTimestamp(),
      });

      toast.success("Data Berhasil Ditambahkan");
      resetForm();
    } catch (error) {
      console.log("Error adding document: ", error);
      alert("Gagal menyimpan data.");
    }
  };

  const clearSignatureSatu = () => {
    signatureRefSatu.current.clear();
  };

  const clearSignatureDua = () => {
    signatureRefDua.current.clear();
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

    const buttonToHideSatu = document.getElementById(
      "hapusTandaTanganButtonSatu"
    );
    if (buttonToHideSatu) {
      buttonToHideSatu.style.display = "none";
    }

    const buttonToHideDua = document.getElementById(
      "hapusTandaTanganButtonDua"
    );
    if (buttonToHideDua) {
      buttonToHideDua.style.display = "none";
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
    pdf.save(`Surat_Surat Jalan_${detail.namaperusahaan}.pdf`);

    element.style.fontSize = "";
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
            Surat Jalan
          </Typography>

          <IconButton onClick={handleDownloadPDF}>
            <Typography style={{ color: BiruAktif, marginRight: 10 }}>
              Download
            </Typography>
            <FileDownloadIcon style={{ color: BiruAktif }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} style={{ margin: 50, padding: 25 }}>
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
            label="No surat Jalan"
            variant="outlined"
            value={noSuratJalan}
            onChange={(e) => setNoSuratJalan(e.target.value)}
            style={{ width: "30%" }}
          />
          <TextField
            label="Tanggal Surat"
            type="date"
            variant="outlined"
            value={tanggalSurat}
            onChange={(e) => setTanggalSurat(e.target.value)}
            style={{ width: "30%" }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="PO Customer"
            variant="outlined"
            value={poCustomer}
            onChange={(e) => setPoCustomer(e.target.value)}
            style={{ width: "30%" }}
          />
          <TextField
            label="Tanggal PO"
            type="date"
            variant="outlined"
            value={tanggalPo}
            onChange={(e) => setTanggalPo(e.target.value)}
            style={{ width: "30%" }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Alamat Kirim"
            multiline
            rows={4}
            variant="outlined"
            value={alamatKirim}
            onChange={(e) => setAlamatKirim(e.target.value)}
            style={{ width: "30%" }}
          />
          <TextField
            label="Up"
            variant="outlined"
            value={up}
            onChange={(e) => setUp(e.target.value)}
            style={{ width: "30%" }}
          />
          <TextField
            label="PenandaTangan"
            variant="outlined"
            value={penandaTangan}
            onChange={(e) => setPenandaTangan(e.target.value)}
            style={{ width: "30%" }}
          />
          <TextField
            label="Penerima"
            variant="outlined"
            value={penerima}
            onChange={(e) => setPenerima(e.target.value)}
            style={{ width: "30%" }}
          />
        </div>

        <div
          style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 50 }}
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
                value={item.namaBarang}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index].namaBarang = e.target.value;
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
              Surat Jalan
            </Typography>
            <Typography>
              <Typography style={{ fontSize: 18 }}>
                {noSuratJalan ? (
                  noSuratJalan
                ) : (
                  <Typography style={{ color: "red", fontSize: 18 }}>
                    No surat jalan belum diisi
                  </Typography>
                )}
              </Typography>
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
            <Typography style={{ fontSize: 20 }}>
              {detail.namaperusahaan}
            </Typography>
            <Typography style={{ fontSize: 20, maxWidth: 500 }}>
              {detail.alamat}
            </Typography>
            {up ? (
              <Typography style={{ fontSize: 20, maxWidth: 500 }}>
                {up}
              </Typography>
            ) : (
              <Typography style={{ fontSize: 20, maxWidth: 500, color: "red" }}>
                Up belum diisi
              </Typography>
            )}
          </div>

          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginBottom: 15,
              }}
            >
              <Typography style={{ fontSize: 20 }}>Tanggal</Typography>
              <Typography style={{ fontSize: 20 }}>
                :{" "}
                {tanggalSurat
                  ? formatDate(tanggalSurat)
                  : formatDate(new Date())}
              </Typography>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Typography style={{ fontSize: 20 }}>PO Customer</Typography>

              {poCustomer ? (
                <Typography style={{ fontSize: 20 }}>: {poCustomer}</Typography>
              ) : (
                <Typography style={{ color: "red", fontSize: 20 }}>
                  : Po belum diisi
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
              ) : (
                <Typography style={{ color: "red", fontSize: 20 }}>
                  : Tanggal Po belum diisi
                </Typography>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Typography style={{ fontSize: 20 }}>Alamat Kirim</Typography>
              {alamatKirim ? (
                <Typography style={{ fontSize: 20 }}>
                  : {alamatKirim}
                </Typography>
              ) : (
                <Typography style={{ color: "red", fontSize: 20 }}>
                  : Alamat kirim belum diisi
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
                  QTY
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
                      {item.jumlahBarang
                        ? item.jumlahBarang
                        : detail.items[index]?.jumlah || "belum ada data"}
                    </TableCell>
                    <TableCell
                      style={{
                        border: "1px solid #ddd",
                        fontSize: 18,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      {item.namaBarang
                        ? item.namaBarang
                        : detail.items[index]?.keterangan || "belum ada data"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 50,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography style={{ fontSize: 18 }}>Hormat Kami,</Typography>
            <Typography style={{ fontSize: 18, fontWeight: "bold" }}>
              PT. BOGART INTI PERKASA
            </Typography>
            <SignatureCanvas
              ref={signatureRefSatu}
              canvasProps={{
                width: 400,
                height: 200,
                className: "signature-canvas",
              }}
            />
            <Button
              id="hapusTandaTanganButtonSatu"
              className="red-button"
              onClick={clearSignatureSatu}
              style={{ textTransform: "none" }}
            >
              Hapus Tanda Tangan
            </Button>
            <Typography style={{ fontSize: 18, fontWeight: "bold" }}>
              {penandaTangan ? (
                penandaTangan
              ) : (
                <Typography style={{ fontSize: 18, color: "red" }}>
                  Penanda tangan belum ditambahkan
                </Typography>
              )}
            </Typography>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography style={{ fontSize: 18 }}>Yang Menerima,</Typography>
            <SignatureCanvas
              ref={signatureRefDua}
              canvasProps={{
                width: 400,
                height: 200,
                className: "signature-canvas",
              }}
            />
            <Button
              id="hapusTandaTanganButtonDua"
              className="red-button"
              onClick={clearSignatureDua}
              style={{ textTransform: "none", marginTop: 35 }}
            >
              Hapus Tanda Tangan
            </Button>
            {penerima ? (
              <Typography style={{ fontSize: 18, fontWeight: "bold" }}>
                {penerima}
              </Typography>
            ) : (
              <Typography style={{ fontSize: 18, color: "red" }}>
                Penerima belum ditambahkan
              </Typography>
            )}
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default SuratJalan;
