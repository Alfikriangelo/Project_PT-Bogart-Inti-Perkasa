import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
const Appbar = () => {
  return (
    <div>
      <Box>
        <AppBar
          position="static"
          style={{ backgroundColor: "white", boxShadow: "none" }}
        >
          <Toolbar>
            <div style={{ marginTop: 10, marginBottom: 10 }}>
              <Typography
                style={{ color: "black", fontWeight: "bold", fontSize: 20 }}
              >
                PT. BOGART INTI PERKASA
              </Typography>
              <Typography style={{ color: "black", fontSize: 20 }}>
                Sistem Informasi Perusahaan
              </Typography>
            </div>
          </Toolbar>
        </AppBar>
      </Box>
    </div>
  );
};

export default Appbar;
