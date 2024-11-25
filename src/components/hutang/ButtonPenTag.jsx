import React from "react";
import Button from "@mui/material/Button";
import { BiruAktif, BiruMuda } from "../../Colors";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";

const ButtonPenTag = () => {
  const navigate = useNavigate();

  return (
    <div style={{ marginTop: 25 }}>
      <Typography
        style={{
          fontSize: 20,
          marginLeft: 25,
          fontWeight: "bold",
          marginBottom: 10,
          color: "black",
        }}
      >
        Menu
      </Typography>
      <div>
        <Button
          style={{
            marginLeft: 25,
            textTransform: "none",
          }}
          variant="outlined"
          onClick={() => navigate("/")}
        >
          Penawaran
        </Button>

        <Button
          style={{
            marginLeft: 25,
            textTransform: "none",
          }}
          variant="outlined"
          onClick={() => navigate("/tagihan")}
        >
          Tagihan
        </Button>
        <Button
          style={{
            marginLeft: 25,
            textTransform: "none",
          }}
          variant="outlined"
          onClick={() => navigate("/piutang")}
        >
          Piutang
        </Button>
        <Button
          style={{
            marginLeft: 25,
            textTransform: "none",
            backgroundColor: BiruAktif,
          }}
          variant="contained"
          onClick={() => navigate("/hutang")}
        >
          Hutang
        </Button>
        <Button
          style={{
            marginLeft: 25,
            textTransform: "none",
          }}
          variant="outlined"
          onClick={() => navigate("/vendor")}
        >
          Vendor
        </Button>
      </div>
      <div style={{ marginTop: 15 }}>
        <Button
          style={{
            marginLeft: 25,
            textTransform: "none",
          }}
          variant="outlined"
          onClick={() => navigate("/keuangan-bulanan")}
        >
          Keuangan Bulanan
        </Button>
      </div>
    </div>
  );
};

export default ButtonPenTag;
