"use client";

import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("./_components/monaco-editor"), {
  ssr: false,
});

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
        }}
      >
        <SandpackLayout>
          <MonacoEditor />
          <SandpackPreview style={{ height: "100vh" }} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

const source = `
import { compile, PageTop, PageBottom, PageBreak, Tailwind } from "@fileforge/react-print";
import * as React from "react";

export const Document = () => {
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
  const [html, setHtml] = React.useState<string>();

  React.useEffect(() => {
    (async () => {
      const html = await compile(<Document />)
      setHtml(html);
    })();
  }, []);

  return <pre>{html}</pre>
}
`.trimStart();
