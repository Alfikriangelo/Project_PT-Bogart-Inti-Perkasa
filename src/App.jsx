// App.jsx
import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Penawaran from "./screens/penawaran/Penawaran";
import Tagihan from "./screens/tagihan/Tagihan"; // Pastikan ini adalah jalur yang benar ke file Tagihan.jsx
import { FirebaseProvider } from "./FirebaseContext"; // Import FirebaseProvider
import TambahPenawaran from "./screens/penawaran/TambahPenawaran";
import DetailPenawaran from "./screens/penawaran/DetailPenawaran";
import SuratPenawaran from "./screens/penawaran/surat/SuratPenawaran";
import SuratPo from "./screens/penawaran/surat/SuratPo";
import Vendor from "./screens/vendor/Vendor";
import TambahVendor from "./screens/vendor/TambahVendor";
import DetailTagihan from "./screens/tagihan/DetailTagihan";
import SuratTagihan from "./screens/tagihan/surat/SuratTagihan";
import SuratJalan from "./screens/tagihan/surat/SuratJalan";
import Piutang from "./screens/piutang/Piutang";
import DetailPiutang from "./screens/piutang/DetailPiutang";
import Hutang from "./screens/hutang/Hutang";
import DetailHutang from "./screens/hutang/DetailHutang";

const App = () => {
  return (
    <FirebaseProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Penawaran />} />
          <Route path="/tambah-penawaran" element={<TambahPenawaran />} />
          <Route path="/detail-penawaran/:id" element={<DetailPenawaran />} />
          <Route path="/surat-penawaran" element={<SuratPenawaran />} />
          <Route path="/surat-po" element={<SuratPo />} />
          <Route path="/tagihan" element={<Tagihan />} />
          <Route path="/surat-tagihan" element={<SuratTagihan />} />
          <Route path="/surat-jalan" element={<SuratJalan />} />
          <Route path="/detail-tagihan/:id" element={<DetailTagihan />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/tambah-vendor" element={<TambahVendor />} />
          <Route path="/piutang" element={<Piutang />} />
          <Route path="/detail-piutang/:id" element={<DetailPiutang />} />
          <Route path="/hutang" element={<Hutang />} />
          <Route path="/detail-hutang/:id" element={<DetailHutang />} />
        </Routes>
      </HashRouter>
    </FirebaseProvider>
  );
};

export default App;
