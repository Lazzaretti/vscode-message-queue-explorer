import { window } from "vscode";
import * as vscode from "vscode";
import { ServiceBusService } from "../logic/connections/implementations/ServiceBusService";
import { Store } from "../logic/store/Store";
import { v4 as uuidv4 } from "uuid";

export async function createConnectionQuickPick(store: Store) {
  const selection = await window.showQuickPick([
    {
      label: "Service Bus with Connection String",
      execute: async () => {
        const connectionString = await window.showInputBox({
          title: "Add ServiceBus Connection by Connection String",
          placeHolder: "ServiceBus Connection String",
        });
        if (connectionString) {
          vscode.window.withProgress(
            {
              title: "try to connect..",
              location: vscode.ProgressLocation.Notification,
            },
            async () => {
              try {
                const service = new ServiceBusService(connectionString);
                const data = await service.getSaveableConnection();
                store.saveNewConnection({
                  type: "ServiceBusConnectionString",
                  id: uuidv4(),
                  name: data.name,
                  data: data.data,
                });
                vscode.window.showInformationMessage(
                  `connected successful to ${data.name}`
                );
                return vscode.commands.executeCommand(
                  "message-queue-explorer.queueTreeView.refresh"
                );
              } catch {
                vscode.window.showErrorMessage("failed to connect");
              }
            }
          );
        }
      },
    },
  ]);
  selection?.execute();
}
