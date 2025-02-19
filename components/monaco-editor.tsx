import Editor, { type Monaco } from "@monaco-editor/react";
import {
  useActiveCode,
  SandpackStack,
  useSandpack,
} from "@codesandbox/sandpack-react";

const extraLibs = Promise.all(
  [
    "https://cdn.jsdelivr.net/npm/@types/react/index.d.ts",
    "https://cdn.jsdelivr.net/npm/@fileforge/react-print@0.1.147/dist/client.d.ts",
    "https://cdn.jsdelivr.net/npm/react-icons@5.3.0/fa/index.d.ts",
    "https://cdn.jsdelivr.net/npm/react-icons@5.3.0/tb/index.d.ts",
    "https://cdn.jsdelivr.net/npm/react-icons@5.3.0/lib/iconBase.d.ts",
    "https://cdn.jsdelivr.net/npm/react-icons@5.3.0/lib/iconContext.d.ts",
    "https://cdn.jsdelivr.net/npm/react-icons@5.3.0/lib/iconsManifest.d.ts",
    "https://cdn.jsdelivr.net/npm/tailwind-merge@2.6.0/dist/types.d.ts",
    "https://cdn.jsdelivr.net/npm/clsx@2.1.1/clsx.d.mts",
  ].map((url) => fetch(url, { cache: "force-cache" }).then((res) => res.text()))
).then(([
  reactTypes,
  reactPrintTypes,
  reactIconsFaTypes,
  reactIconsTbTypes,
  reactIconsLibIconBaseTypes,
  reactIconsLibIconContextTypes,
  reactIconsLibIconsManifestTypes,
  tailwindMergeTypes,
  clsxTypes,
]) => ({
  "file://node_modules/@types/react/index.d.ts": `declare module "react" { ${reactTypes} }`,
  "file://node_modules/@fileforge/react-print/client.d.ts": `declare module "@fileforge/react-print" { ${reactPrintTypes} }`,
  "file://node_modules/react-icons/fa/index.d.ts": `declare module "react-icons/fa" { ${reactIconsLibIconBaseTypes}\n${reactIconsLibIconContextTypes}\n${reactIconsLibIconsManifestTypes}\n${reactIconsFaTypes.replace("import type { IconType } from '../lib/index'", "")} }`,
  "file://node_modules/react-icons/tb/index.d.ts": `declare module "react-icons/tb" { ${reactIconsLibIconBaseTypes}\n${reactIconsLibIconContextTypes}\n${reactIconsLibIconsManifestTypes}\n${reactIconsTbTypes.replace("import type { IconType } from '../lib/index'", "")} }`,
  "file://node_modules/tailwind-merge/index.d.ts": `declare module "tailwind-merge" { ${tailwindMergeTypes} }`,
  "file://node_modules/clsx/index.d.ts": `declare module "clsx" { ${clsxTypes} }`,
}));

export default function MonacoEditor() {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();

  return (
    <SandpackStack style={{ height: "100vh", margin: 0 }}>
      <div style={{ flex: 1, paddingTop: 8, background: "#1e1e1e" }}>
        <Editor
          width="100%"
          height="100%"
          language="typescript"
          theme="vs-dark"
          key={sandpack.activeFile}
          defaultValue={code}
          path={`file://${sandpack.activeFile}`}
          onChange={(value) => updateCode(value || "")}
          beforeMount={setupMonaco}
        />
      </div>
    </SandpackStack>
  );
}

const setupMonaco = (monaco: Monaco) => {
  // https://stackoverflow.com/q/76900244
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    jsxFactory: "React.createElement",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
    checkJs: true,
    strict: true,
  });

  (async () => {
    const libs = await extraLibs;
    for (const [uri, content] of Object.entries(libs)) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(content, uri);
    }
  })();
};
