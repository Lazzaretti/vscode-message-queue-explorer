import * as vscode from "vscode";
import { ConnectionFacade } from "../facade/ConnectionFacade";
import { IConnectionItem } from "../facade/models/IConnectionItem";
import { ConnectionTreeItem } from "./items/ConnectionTreeItem";
import { MQTreeItem } from "./items/MQTreeItem";
import { ChannelTreeItem } from "./items/ChannelTreeItem";
import { IChannel } from "../logic/connections/models/IChannel";
import { ChannelLeafItem } from "./items/ChannelLeafItem";

export class QueueTreeProvider implements vscode.TreeDataProvider<MQTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    MQTreeItem | undefined | void
  > = new vscode.EventEmitter<MQTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<MQTreeItem | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private connectionFacade: ConnectionFacade) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: MQTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: MQTreeItem): Promise<MQTreeItem[]> {
    if (element) {
      switch (element.contextValue) {
        case "ConnectionItem":
          const connectionElement = element as ConnectionTreeItem;
          const channels =
            await this.connectionFacade.getChannelsByConnectionId(
              connectionElement.connectionId
            );
          return channels.map((c) =>
            this.mapChannelItem(connectionElement.connectionId, c)
          );
        case "ChannelTreeItem":
          const channel = element as ChannelTreeItem;
          switch (channel.channelType) {
            case "Queue":
              return [
                new ChannelLeafItem(
                  channel.connectionId,
                  "Queue",
                  "Normal",
                  channel.name
                ),
                new ChannelLeafItem(
                  channel.connectionId,
                  "Queue",
                  "DeadLetter",
                  channel.name
                ),
              ];
            default:
              return [];
          }
        default:
          return [];
      }
    } else {
      const connections = this.connectionFacade.getConnections();
      vscode.commands.executeCommand(
        "setContext",
        "message-queue-explorer.hasConnections",
        !!connections
      );

      return connections.map((c) => this.mapConnectionItem(c));
    }
  }

  mapConnectionItem(item: IConnectionItem): MQTreeItem {
    return new ConnectionTreeItem(
      item.id,
      item.name,
      vscode.TreeItemCollapsibleState.Collapsed
    );
  }
  mapChannelItem(connectionId: string, item: IChannel): MQTreeItem {
    return new ChannelTreeItem(
      connectionId,
      item.name,
      item.status,
      item.channelType,
      item.channelType === "Queue"
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None,
      item.totalMessageCount,
      item.deadLetterMessageCount
    );
  }
}
