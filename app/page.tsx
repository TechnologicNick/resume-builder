"use client";

import { PDFViewer } from "@/components/pdf-viewer";
import {
  SandpackConsole,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MonacoEditor = dynamic(() => import("./_components/monaco-editor"), {
  ssr: false,
});

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

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
    <div>
      <SandpackProvider
        theme="dark"
        template="react-ts"
        customSetup={{
          dependencies: {
            "@fileforge/react-print": "^0.1.144",
          },
        }}
        files={{
          "/App.tsx": {
            code: source,
          },
        }}
      >
        <SandpackLayout>
          <MonacoEditor />
          <SandpackPreview style={{ height: "100vh" }} />
          <SandpackConsole style={{ height: "100vh" }} />
          <PDFViewer file={file} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

const source = `
import { compile, PageTop, PageBottom, PageBreak, Tailwind } from "@fileforge/react-print";
import * as React from "react";

export const Document = () => {
  // No JSX syntax highlighting sadly, I tried
  return (
    <Tailwind>
      <PageTop>
        <span>Hello #1</span>
      </PageTop>
      <div>Hello #2</div>
      <PageBottom>
        <div className="text-gray-400 text-sm">Hello #3</div>
      </PageBottom>
      <PageBreak />
      <span>Hello #4, but on a new page ! </span>
    </Tailwind>
  );
};

export default function App() {
  React.useEffect(() => {
    (async () => {
      const html = await compile(<Document />)

      const res = await fetch("http://localhost:3000/pdf", {
        method: "POST",
        body: html
      });

      const buffer = await res.arrayBuffer();
      
      window.parent.postMessage({
        type: "render-pdf",
        buffer
      }, "*", [buffer]);
    })();
  }, []);

  return null
}
`.trimStart();
