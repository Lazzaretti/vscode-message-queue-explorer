import { ConnectionPool } from "../logic/connections/ConnectionPool";
import { ConnectionType } from "../logic/store/IConnection";
import { Store } from "../logic/store/Store";
import { IConnectionItem, ProviderType } from "./models/IConnectionItem";
import { assertUnreachable } from "../helpers";
import { IChannel, QueueSubType } from "../logic/connections/models/IChannel";
import { IMessage } from "../logic/models/IMessage";

export type IMessageCommand = "Requeue";

export class ConnectionFacade {
  constructor(private store: Store, private connectionPool: ConnectionPool) {}

  async getChannelsByConnectionId(id: string): Promise<IChannel[]> {
    const activeConnection = this.connectionPool.getByConnectionId(id);
    return await activeConnection.getChannels();
  }

  async getMessages(
    connectionId: string,
    name: string,
    queueSubType: QueueSubType
  ): Promise<IMessage[]> {
    const activeConnection =
      this.connectionPool.getByConnectionId(connectionId);
    return await activeConnection.peekMessages(name, queueSubType);
  }

  getConnections(): IConnectionItem[] {
    const items = this.store.getConnections();
    return items.map((c) => ({
      id: c.id,
      name: c.name,
      providerType: this.mapType(c.type),
      conectionType: c.type,
    }));
  }

  async removeConnection(connectionId: string) {
    await this.closeConnection(connectionId);
    await this.store.deleteConnection(connectionId);
  }

  async closeConnection(connectionId: string) {
    await this.connectionPool.closeConnectionIfOpen(connectionId);
  }

  async executeCommandOnMessage(
    messageCommand: IMessageCommand,
    connectionId: string,
    channelName: string,
    messageId: string
  ) {
    const activeConnection =
      this.connectionPool.getByConnectionId(connectionId);
    await activeConnection.executeCommandOnMessage(
      messageCommand,
      channelName,
      messageId
    );
  }

  private mapType(connectionType: ConnectionType): ProviderType {
    switch (connectionType) {
      case "ServiceBusConnectionString":
        return "ServiceBus";
    }
    return assertUnreachable(connectionType);
  }
}
