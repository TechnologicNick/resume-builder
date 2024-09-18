"use client";

import { PDFViewer } from "@/components/pdf-viewer";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useActiveCode,
} from "@codesandbox/sandpack-react";
import MonacoEditor from "@/components/monaco-editor";
import { useEffect, useState } from "react";

export default function Home() {
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
          "/render.ts": {
            code: renderSource,
            hidden: true,
          },
          "/index.tsx": {
            code: indexSource,
            hidden: true,
          },
        }}
        options={{
          bundlerTimeOut: 90_000,
        }}
      >
        <HashUpdater />
        <SandpackLayout style={{ position: "relative" }}>
          <MonacoEditor />
          {/* <SandpackCodeEditor style={{ height: "100vh" }} /> */}
          <SandpackPreview
            style={{ height: "100vh" }}
            actionsChildren={<DownloadButton />}
          />
          <PDFViewer />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

function DownloadButton() {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent<any>) {
      if (
        typeof event.data !== "object" ||
        event.data.type !== "rendered-to-html" ||
        typeof event.data.html !== "string"
      ) {
        return;
      }

      setHtml(event.data.html);
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <form
      action="http://localhost:3000/pdf"
      method="POST"
      target="_blank"
      encType="text/plain"
    >
      <input type="hidden" name="<!--html" value={"--!>\n" + html} />
      <button className="sandpack-button" type="submit">
        Download PDF
      </button>
    </form>
  );
}

function HashUpdater() {
  const { code } = useActiveCode();

  useEffect(() => {
    window.history.replaceState(null, "", `#${btoa(code)}`);
  }, [code]);

  return null;
}

const source =
  typeof window !== "undefined" && window.location.hash
    ? atob(window.location.hash.slice(1))
    : `
import { PageTop, PageBottom, PageBreak, Tailwind } from "@fileforge/react-print";
import * as React from "react";
// @ts-ignore
import { render } from "./render";

export default function Document() {
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

render(<Document />);
`.trimStart();

const renderSource = `
import { compile } from "@fileforge/react-print";

let lastHtml: string | null = null;

export async function render(element: JSX.Element) {
  const html = await compile(element)

  if (html === lastHtml) {
    return;
  }

  window.parent.postMessage({
    type: "rendered-to-html",
    html
  }, "*");

  const res = await fetch("http://localhost:3000/pdf", {
    method: "POST",
    body: html
  });
  const buffer = await res.arrayBuffer();
  
  window.parent.postMessage({
    type: "render-pdf",
    buffer
  }, "*", [buffer]);

  lastHtml = html;
}
`.trimStart();

const indexSource = `
import "./App";
`.trimStart();
