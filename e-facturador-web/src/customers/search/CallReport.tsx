import apiClient from "../../services/apiClient";

const apiReportFactura = "/api/v1/facturacion/facturas";

export async function CallReportById(
    uri: string = "",
    referenciaNumber: number
) {
    if (referenciaNumber > 0) {
        const url = `${apiReportFactura}/${uri}/${referenciaNumber}`;
        const windowFeatures = "resizable=yes,scrollbars=yes,status=yes";

        console.log("URL:", url);

        try {
            const response = await apiClient.get(url, {
                responseType: "blob"
            });

            const pdfBlob = new Blob([response.data], {
                type: "application/pdf"
            });

            const fileURL = URL.createObjectURL(pdfBlob);

            window.open(fileURL, "Reporte", windowFeatures);
        } catch (error) {
            console.error("Error:", error);
        }
    }
}