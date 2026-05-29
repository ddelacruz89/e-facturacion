import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

type Props = {
    logo: number[] | string;
};

const LOGO_WIDTH = 220;
const LOGO_HEIGHT = 130;

const LogoImg: React.FC<Props> = ({ logo }) => {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (typeof logo === "string" && logo.length > 0) {
            setLogoUrl(`data:image/png;base64,${logo}`);
        } else if (Array.isArray(logo) && logo.length > 0) {
            const uint8Array = new Uint8Array(logo);
            const blob = new Blob([uint8Array], { type: "image/png" });
            const url = URL.createObjectURL(blob);
            setLogoUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setLogoUrl(null);
        }
    }, [logo]);

    return (
        <Box
            sx={{
                width: LOGO_WIDTH,
                height: LOGO_HEIGHT,
                border: logoUrl ? "2px solid #525C71" : "2px dashed #67748F",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                cursor: "pointer",
                mb: 2,
                backgroundColor: logoUrl ? "#fff" : "#f0f2f5",
                transition: "border-color 0.2s, background-color 0.2s",
                "&:hover": {
                    borderColor: "#3D4453",
                    backgroundColor: logoUrl ? "#f9f9f9" : "#e8eaed",
                },
            }}
        >
            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt="Logo"
                    style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                    }}
                />
            ) : (
                <Box sx={{ textAlign: "center", color: "#848EA5", userSelect: "none" }}>
                    <UploadFileIcon sx={{ fontSize: 36, mb: 0.5 }} />
                    <Typography variant="caption" display="block" sx={{ fontSize: 11 }}>
                        Subir logo
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default LogoImg;
