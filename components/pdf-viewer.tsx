import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.js`;

const options: React.ComponentProps<typeof Document>["options"] = {
  cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
};

/**
 * PDFViewer component that listens for messages from the parent window
 */
export const PDFViewer = ({ scale = 1 }: { scale?: number }) => {
  const [files, setFiles] = useState<
    { key: string; file: File; scale: number }[]
  >([]);
  const scaleRef = useRef(scale);

  useEffect(() => {
    function handleMessage(event: MessageEvent<any>) {
      if (
        typeof event.data !== "object" ||
        event.data.type !== "render-pdf" ||
        !(event.data.buffer instanceof ArrayBuffer)
      ) {
        return;
      }

      const file = new File([event.data.buffer], "document.pdf", {
        type: "application/pdf",
      });

      setFiles((files) =>
        [
          {
            key: crypto.randomUUID(),
            file,
            scale: scaleRef.current,
          },
        ]
          .concat(files)
          .slice(0, 2)
      );
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (scale !== scaleRef.current) {
      scaleRef.current = scale;
      setFiles((files) =>
        [
          {
            key: crypto.randomUUID(),
            file: files[0]?.file,
            scale: scaleRef.current,
          },
        ]
          .concat(files)
          .slice(0, 2)
      );
    }
  }, [scale]);

  const onLoadSuccessReal = useCallback((removeFilesOlderThan: File) => {
    setFiles((currentFiles) => {
      let index = 0;
      for (let i = 0; i < currentFiles.length; i++) {
        if (currentFiles[i].file === removeFilesOlderThan) {
          index = i;
          break;
        }
      }

      return currentFiles.slice(0, index + 1);
    });
  }, []);

  return (
    <div className="pdf-container">
      {files.map(({ key, file, scale }) => (
        <PDF
          key={key}
          file={file}
          onLoadSuccessReal={onLoadSuccessReal}
          scale={scale}
        />
      ))}
    </div>
  );
};

/**
 * Wrapper around react-pdf's Document component to handle loading state
 */
const PDF = memo(
  ({
    file,
    onLoadSuccessReal,
    scale,
  }: {
    file: File;
    onLoadSuccessReal?: (file: File) => void;
    scale?: number;
  }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [numPagesLoaded, setNumPagesLoaded] = useState(0);
    const loading = numPages !== numPagesLoaded;

    useEffect(() => {
      if (numPages === numPagesLoaded) {
        onLoadSuccessReal?.(file);
      }
    }, [file, numPages, numPagesLoaded, onLoadSuccessReal]);

    return (
      <Document
        file={file}
        onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
        options={options}
        className={loading ? "hidden" : ""}
      >
        {numPages &&
          Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              onRenderSuccess={() => {
                setNumPagesLoaded((current) => current + 1);
              }}
              scale={scale}
            />
          ))}
      </Document>
    );
  }
);
