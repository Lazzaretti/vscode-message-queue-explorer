import { ConnectionFactory } from "./ConnectionFactory";
import { IActiveConnection } from "./models/IActiveConnection";

export class ConnectionPool {
  private connections: Map<string, IActiveConnection> = new Map<
    string,
    IActiveConnection
  >();

  constructor(private connectionFactory: ConnectionFactory) {}

  getByConnectionId(id: string): IActiveConnection {
    const connection = this.connections.get(id);
    if (connection) {
      return connection;
    }

    const newConnection = this.connectionFactory.createConnectionById(id);
    this.connections.set(id, newConnection);
    return newConnection;
  }

  async closeConnectionIfOpen(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    this.connections.delete(connectionId);
    await connection.close();
  }
}
