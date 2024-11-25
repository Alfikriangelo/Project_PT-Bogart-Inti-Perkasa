import React from "react";
import Appbar from "../../components/penawaran/Appbar";
import ButtonPenTag from "../../components/penawaran/ButtonPenTag";
import TablePenawaran from "../../components/penawaran/TablePenawaran";

const Penawaran = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "white" }}>
      <Appbar />
      <ButtonPenTag />
      <TablePenawaran />
    </div>
  );
};

export default Penawaran;
