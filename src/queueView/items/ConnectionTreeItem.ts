import * as vscode from "vscode";
import { MQTreeItem } from "./MQTreeItem";

export class ConnectionTreeItem extends MQTreeItem {
  constructor(
    public readonly connectionId: string,
    public readonly name: string,
    public collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    const label = `${name}`;
    super(label, collapsibleState);

    this.tooltip = label;
    this.description = "";
  }

  contextValue = "ConnectionItem";
  iconPath = new vscode.ThemeIcon("plug");
}
