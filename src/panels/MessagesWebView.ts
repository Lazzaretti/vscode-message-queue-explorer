import * as vscode from "vscode";
import {
  ConnectionFacade,
  ISubChannelIdentifier,
} from "../facade/ConnectionFacade";
import { getUri } from "../helpers";
import { IMessage } from "../logic/models/IMessage";

export interface IMessagesPanelArgs {
  connectionId: string;
  channelIdentifier: ISubChannelIdentifier;
}

export class MessagesWebView {
  public static readonly viewId = "message-queue-explorer.messages";

  private panel?: vscode.WebviewPanel;
  private args?: IMessagesPanelArgs;
  private disposables: vscode.Disposable[] = [];
  private messages: IMessage[] = [];
  private isLoading = true;

  constructor(
    private connectionFacade: ConnectionFacade,
    private extensionUri: vscode.Uri
  ) {}

  public open(args: IMessagesPanelArgs) {
    this.args = args;
    this.panel = vscode.window.createWebviewPanel(
      MessagesWebView.viewId,
      "Messages",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage((data) => {
      switch (data.command) {
        case "requeue": {
          this.connectionFacade
            .executeCommandOnMessage(
              "Requeue",
              args.connectionId,
              args.channelIdentifier,
              data.messageId
            )
            .then(() =>
              vscode.window.showInformationMessage("requeued message")
            )
            .catch((e) =>
              vscode.window.showErrorMessage(
                "Requeue failed: " + JSON.stringify(e)
              )
            )
            .finally(() => this.reloadTreeAndDetail());
          break;
        }
        case "open-body": {
          const message = this.messages.filter(
            (x) => x.messageId === data.messageId
          )[0];
          vscode.workspace
            .openTextDocument({
              language: "json",
              content: JSON.stringify(message.body),
            })
            .then((document) => {
              vscode.window.showTextDocument(document);
            });
          break;
        }
        case "delete": {
          this.connectionFacade
            .executeCommandOnMessage(
              "Delete",
              args.connectionId,
              args.channelIdentifier,
              data.messageId
            )
            .then(() => {
              vscode.window.showInformationMessage("message deleted");
            })
            .catch((e) =>
              vscode.window.showErrorMessage(
                "Delete failed: " + JSON.stringify(e)
              )
            )
            .finally(() => this.reloadTreeAndDetail());
          break;
        }
      }
    });

    this.loadMessagesAndUpdateView();
  }

  private reloadTreeAndDetail() {
    vscode.commands.executeCommand(
      "message-queue-explorer.queueTreeView.refresh"
    );
    this.loadMessagesAndUpdateView();
  }

  private async loadMessagesAndUpdateView() {
    if (!this.args) {
      return;
    }

    this.isLoading = true;
    this.messages = [];
    this.updateView();

    this.messages = await this.connectionFacade.getMessages(
      this.args.connectionId,
      this.args.channelIdentifier
    );

    this.isLoading = false;
    this.updateView();
  }

  private updateView() {
    if (!this.panel || !this.args) {
      return;
    }

    let title = `${this.args.channelIdentifier.channelType}`;
    if (this.args.channelIdentifier.subType === "DeadLetter") {
      title += "DLX ";
    }
    title += ` ${this.args.channelIdentifier.name}`;
    this.panel.title = title;

    const webview = this.panel.webview;

    const toolkitUri = getUri(webview, this.extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js", // A toolkit.min.js file is also available
    ]);
    const mainUri = getUri(webview, this.extensionUri, [
      "webview-ui",
      "main.js",
    ]);
    const styleUri = getUri(webview, this.extensionUri, [
      "webview-ui",
      "style.css",
    ]);

    const content = this.messages
      .map(
        (m) => /*html*/ `
        <div class="msg">
          <vscode-text-field class="msg-header" value="${this.escapeToString(
            m.messageId
          )}" disabled>messageId</vscode-text-field>
          <vscode-text-field class="msg-header" value="${this.escapeToString(
            m.contentType
          )}" disabled>contentType</vscode-text-field>
          <vscode-text-field class="msg-header" value="${this.escapeToString(
            m.subject
          )}" disabled>subject</vscode-text-field>
          <div class="msg-action">${this.getActionsHtml(m)}</div>
          <vscode-text-field class="msg-body" value="${this.escapeToString(
            m.body
          )}" disabled>body</vscode-text-field>
        </div>
      `
      )
      .join("");

    webview.html = /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type="module" src="${toolkitUri}"></script>
          <script type="module" src="${mainUri}"></script>
          <link rel="stylesheet" href="${styleUri}">
          <title>${title}</title>
        </head>
        <body>
          <h1>${title}</h1>
          ${this.isLoading ? "<h2>loading...</h2>" : ""}
          <article id="messages">
            ${content}
          </article>
        </body>
      </html>
    `;
  }

  private getActionsHtml(m: IMessage) {
    let actions = "";
    if (m.messageId) {
      if (this.args?.channelIdentifier?.subType === "DeadLetter") {
        actions += `<vscode-button class="btn-requeue" data-message-id="${this.escapeToString(
          m.messageId
        )}">Requeue</vscode-button>`;
      }
      actions += `<vscode-button class="btn-open-body" data-message-id="${this.escapeToString(
        m.messageId
      )}">Open</vscode-button>`;
      actions += `<vscode-button class="btn-delete" appearance="secondary" data-message-id="${this.escapeToString(
        m.messageId
      )}">Delete</vscode-button>`;
    }
    return actions;
  }

  private escapeToString(input?: any): string {
    if (!input) {
      return "";
    }
    if (typeof input !== "string") {
      input = JSON.stringify(input);
    }
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  public dispose() {
    this.panel?.dispose();

    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
