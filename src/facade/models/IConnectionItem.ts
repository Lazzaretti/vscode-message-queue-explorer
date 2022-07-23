import { ConnectionType } from "../../logic/store/IConnection";

export type ProviderType = "ServiceBus";

export interface IConnectionItem {
  providerType: ProviderType;
  conectionType: ConnectionType;
  id: string;
  name: string;
}
