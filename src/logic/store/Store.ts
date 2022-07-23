import * as vscode from "vscode";
import { IConnection } from "./IConnection";

export class Store {
  private static keyConnection = "connection";

  constructor(private state: vscode.Memento) {}

  saveNewConnection(connection: IConnection) {
    const connections = this.getConnections();
    connections.push(connection);
    this.saveConnections(connections);
  }

  getConnections(): IConnection[] {
    const stringified = this.state.get(Store.keyConnection) as string;
    return JSON.parse(stringified);
  }

  getConnectionById(id: string): IConnection {
    const connections = this.getConnections();
    return connections.filter((c) => c.id === id)[0];
  }

  deleteConnection(connectionId: string) {
    let connections = this.getConnections();
    connections = connections.filter((c) => c.id !== connectionId);
    this.saveConnections(connections);
  }

  private saveConnections(connections: IConnection[]) {
    const stringified = JSON.stringify(connections);
    this.state.update(Store.keyConnection, stringified);
  }
}
