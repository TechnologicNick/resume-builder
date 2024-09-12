"use client";

import { PDFViewer } from "@/components/pdf-viewer";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import MonacoEditor from "./_components/monaco-editor";

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
      >
        <SandpackLayout style={{ position: "relative" }}>
          <MonacoEditor />
          {/* <SandpackCodeEditor style={{ height: "100vh" }} /> */}
          <SandpackPreview style={{ height: "100vh" }} />
          <PDFViewer />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

const source = `
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

export async function render(element: JSX.Element) {
  const html = await compile(element)
  const res = await fetch("http://localhost:3000/pdf", {
    method: "POST",
    body: html
  });
  const buffer = await res.arrayBuffer();
  
  window.parent.postMessage({
    type: "render-pdf",
    buffer
  }, "*", [buffer]);
}
`.trimStart();

const indexSource = `
import "./App";
`.trimStart();
