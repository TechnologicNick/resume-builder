import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.js`;

const options: React.ComponentProps<typeof Document>["options"] = {
  cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
};

export const PDFViewer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [lastLoadedPdf, setLastLoadedPdf] = useState<null | PDFDocumentProxy>(
    null
  );

  useEffect(() => {
    function handleMessage(event: MessageEvent<any>) {
      if (
        typeof event.data !== "object" ||
        event.data.type !== "render-pdf" ||
        !(event.data.buffer instanceof ArrayBuffer)
      ) {
        return;
      }

      setFile(
        new File([event.data.buffer], "document.pdf", {
          type: "application/pdf",
        })
      );
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="pdf-container">
      {lastLoadedPdf &&
        Array.from(new Array(lastLoadedPdf.numPages), (_, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            pdf={lastLoadedPdf}
            renderAnnotationLayer={false}
          />
        ))}

      <Document
        file={file}
        onLoadSuccess={(pdf) => setLastLoadedPdf(pdf)}
        options={options}
      />
    </div>
  );
};
