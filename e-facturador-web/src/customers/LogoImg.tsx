import React, { useEffect, useState } from "react";

type Props = {
  logo: number[];
};

const LogoImg: React.FC<Props> = ({ logo }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof logo === "string") {
      setLogoUrl(`data:image/png;base64,${logo}`);
    } else {
      const uint8Array = new Uint8Array(logo || []); // Convertir el array a Uint8Array
      if (logo) {
        const blob = new Blob([uint8Array], { type: "image/png" }); // o "image/jpeg" según el tipo real
        const url = URL.createObjectURL(blob);
        setLogoUrl(url);

        return () => {
          URL.revokeObjectURL(url); // liberar memoria cuando se desmonte
        };
      } else {
        setLogoUrl(null);
      }
    }
  }, [logo]);

  if (!logoUrl) {
    return <p>No hay logo disponible</p>;
  } else {
    console.log("logoUrl-", logoUrl);
  }
  return <img src={logoUrl} alt="Logo" style={{ maxWidth: "200px", cursor: "pointer" }} />
}





export default LogoImg;
