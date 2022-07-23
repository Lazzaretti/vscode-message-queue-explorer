import * as vscode from "vscode";
import {
  ChannelType,
  QueueSubType,
} from "../../logic/connections/models/IChannel";
import { IMessagesPanelArgs } from "../../panels/MessagesWebView";
import { MQTreeItem } from "./MQTreeItem";

export class ChannelLeafItem extends MQTreeItem {
  constructor(
    public readonly connectionId: string,
    public readonly channelType: ChannelType,
    public readonly queueSubType: QueueSubType,
    public readonly name: string
  ) {
    super(queueSubType, vscode.TreeItemCollapsibleState.None);
    const args: IMessagesPanelArgs = {
      connectionId: connectionId,
      name,
      queueSubType: queueSubType,
    };
    this.command = {
      command: "message-queue-explorer.openQueue",
      title: "Open",
      arguments: [args],
    };
  }
}
