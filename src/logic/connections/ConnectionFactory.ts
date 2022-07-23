import { assertUnreachable } from "../../helpers";
import { IConnection } from "../store/IConnection";
import { Store } from "../store/Store";
import { IActiveConnection } from "./models/IActiveConnection";
import { ServiceBusService } from "./implementations/ServiceBusService";

export class ConnectionFactory {
  constructor(private store: Store) {}

  createConnectionById(id: string): IActiveConnection {
    const definition = this.store.getConnectionById(id);
    return this.createConnection(definition);
  }

  createConnection(item: IConnection): IActiveConnection {
    switch (item.type) {
      case "ServiceBusConnectionString":
        return new ServiceBusService(item.data);
    }
    assertUnreachable(item.type);
  }
}
