import React from "react";
import Appbar from "../../components/penawaran/Appbar";
import ButtonPenTag from "../../components/piutang/ButtonPenTag";
import CardPiutang from "../../components/piutang/CardPiutang";

const Piutang = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "white" }}>
      <Appbar />
      <ButtonPenTag />
      <CardPiutang />
    </div>
  );
};

export default Piutang;
