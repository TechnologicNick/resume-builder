import { Sandpack } from "@codesandbox/sandpack-react";

export default function Home() {
  return (
    <div>
      <Sandpack
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
        options={{
          editorHeight: "100%",
        }}
      />
    </div>
  );
}

const source = `
import { compile, PageTop, PageBottom, PageBreak, Tailwind } from "@fileforge/react-print";
import * as React from "react";

export const Document = ({ props }) => {
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
  const [html, setHtml] = React.useState();

  React.useEffect(() => {
    (async () => {
      const html = await compile(<Document />)
      setHtml(html);
    })();
  }, []);

  return <pre>{html}</pre>
}
`.trimStart();
