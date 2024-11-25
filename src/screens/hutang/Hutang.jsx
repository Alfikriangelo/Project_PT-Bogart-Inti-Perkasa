import React from "react";
import Appbar from "../../components/hutang/Appbar";
import ButtonPenTag from "../../components/hutang/ButtonPenTag";
import CardHutang from "../../components/hutang/CardHutang";

const Hutang = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "white" }}>
      <Appbar />
      <ButtonPenTag />
      <CardHutang />
    </div>
  );
};

export default Hutang;
