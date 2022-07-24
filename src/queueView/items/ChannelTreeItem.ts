import * as vscode from "vscode";
import { MQTreeItem } from "./MQTreeItem";
import { ChannelStatus } from "../../logic/connections/models/IChannel";
import { IChannelIdentifier } from "../../facade/ConnectionFacade";

export class ChannelTreeItem extends MQTreeItem {
  constructor(
    public readonly connectionId: string,
    public readonly channelIdentifier: IChannelIdentifier,
    public readonly status: ChannelStatus,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly deadLetterMessageCount?: number,
    public readonly totalMessageCount?: number
  ) {
    const label = `${channelIdentifier.name} (${
      totalMessageCount === undefined ? "" : totalMessageCount
    }/${deadLetterMessageCount === undefined ? "" : deadLetterMessageCount})`;
    super(label, collapsibleState);

    this.iconPath = new vscode.ThemeIcon("symbol-function");

    this.tooltip = `type: ${channelIdentifier.channelType}, status: ${status}`;
    this.description = "";
  }

  contextValue = "ChannelTreeItem";
}
