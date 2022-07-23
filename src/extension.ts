// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { QueueTreeProvider } from "./queueView/QueueTreeProvider";
import { createConnectionQuickPick } from "./createConnection/CreateConnectionQuickPick";
import { Store } from "./logic/store/Store";
import { ConnectionFacade } from "./facade/ConnectionFacade";
import { ConnectionPool } from "./logic/connections/ConnectionPool";
import { ConnectionFactory } from "./logic/connections/ConnectionFactory";
import { MessagesWebView } from "./panels/MessagesWebView";
import { ConnectionTreeItem } from "./queueView/items/ConnectionTreeItem";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const store = new Store(context.globalState);
  const connectionFactory = new ConnectionFactory(store);
  const connectionPool = new ConnectionPool(connectionFactory);
  const connectionFacade = new ConnectionFacade(store, connectionPool);

  const queueTreeProvider = new QueueTreeProvider(connectionFacade);
  vscode.window.registerTreeDataProvider(
    "message-queue-explorer.queueTreeView",
    queueTreeProvider
  );

  vscode.commands.registerCommand(
    "message-queue-explorer.queueTreeView.refresh",
    () => queueTreeProvider.refresh()
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "message-queue-explorer.addConnection",
      () => createConnectionQuickPick(store)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "message-queue-explorer.openQueue",
      (args) => {
        const panel = new MessagesWebView(
          connectionFacade,
          context.extensionUri
        );
        panel.open(args);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "message-queue-explorer.disconnectConnection",
      async (item) => {
        if (item instanceof ConnectionTreeItem) {
          await connectionFacade.closeConnection(item.connectionId);
          return vscode.commands.executeCommand(
            "message-queue-explorer.queueTreeView.refresh"
          );
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "message-queue-explorer.deleteConnection",
      async (item) => {
        if (item instanceof ConnectionTreeItem) {
          await connectionFacade.removeConnection(item.connectionId);
          return vscode.commands.executeCommand(
            "message-queue-explorer.queueTreeView.refresh"
          );
        }
      }
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
