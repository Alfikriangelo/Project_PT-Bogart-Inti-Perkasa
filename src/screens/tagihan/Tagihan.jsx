import React from "react";
import Appbar from "../../components/penawaran/Appbar";
import ButtonPenTag from "../../components/tagihan/ButtonPenTag";
import TableTagihan from "../../components/tagihan/TableTagihan";

const Tagihan = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "white" }}>
      <Appbar />
      <ButtonPenTag />
      <TableTagihan />
    </div>
  );
};

export default Tagihan;
