import { Uri, Webview } from "vscode";

export function getUri(
  webview: Webview,
  extensionUri: Uri,
  pathList: string[]
) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}
export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}
