const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  const messages = document.getElementById("messages");
  messages.addEventListener("click", function (e) {
    if (e.target) {
      if (e.target.classList.contains("btn-requeue")) {
        vscode.postMessage({
          command: "requeue",
          messageId: e.target.dataset.messageId,
        });
      }
      if (e.target.classList.contains("btn-open-body")) {
        vscode.postMessage({
          command: "open-body",
          messageId: e.target.dataset.messageId,
        });
      }
    }
  });
}
