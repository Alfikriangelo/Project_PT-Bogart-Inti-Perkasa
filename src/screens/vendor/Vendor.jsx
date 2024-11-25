import React from "react";
import Appbar from "../../components/penawaran/Appbar";
import ButtonPenTag from "../../components/vendor/ButtonPenTag";
import TableVendor from "../../components/vendor/TableVendor";

const Vendor = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "white" }}>
      <Appbar />
      <ButtonPenTag />
      <TableVendor />
    </div>
  );
};

export default Vendor;
