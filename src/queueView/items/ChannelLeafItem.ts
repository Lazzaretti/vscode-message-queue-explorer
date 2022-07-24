import * as vscode from "vscode";
import { IMessagesPanelArgs } from "../../panels/MessagesWebView";
import { MQTreeItem } from "./MQTreeItem";
import { ISubChannelIdentifier } from "../../facade/ConnectionFacade";

export class ChannelLeafItem extends MQTreeItem {
  constructor(
    public readonly connectionId: string,
    public readonly channelIdentifier: ISubChannelIdentifier
  ) {
    const name =
      channelIdentifier.subType?.toString() ??
      channelIdentifier.channelType.toString();
    super(name, vscode.TreeItemCollapsibleState.None);
    const args: IMessagesPanelArgs = {
      connectionId,
      channelIdentifier,
    };
    this.command = {
      command: "message-queue-explorer.openChannel",
      title: "Open",
      arguments: [args],
    };
  }
}
