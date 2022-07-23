import * as vscode from "vscode";
import { MQTreeItem } from "./MQTreeItem";
import {
  ChannelStatus,
  ChannelType,
} from "../../logic/connections/models/IChannel";

export class ChannelTreeItem extends MQTreeItem {
  constructor(
    public readonly connectionId: string,
    public readonly name: string,
    public readonly status: ChannelStatus,
    public readonly channelType: ChannelType,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly deadLetterMessageCount?: number,
    public readonly totalMessageCount?: number
  ) {
    const label = `${name} (${
      totalMessageCount === undefined ? "" : totalMessageCount
    }/${deadLetterMessageCount === undefined ? "" : deadLetterMessageCount})`;
    super(label, collapsibleState);

    this.iconPath = new vscode.ThemeIcon("symbol-function");

    this.tooltip = `type: ${channelType}, status: ${status}`;
    this.description = "";
  }

  contextValue = "ChannelTreeItem";
}
