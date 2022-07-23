export type ConnectionType = "ServiceBusConnectionString";

export interface IConnection {
  type: ConnectionType;
  id: string;
  name: string;
  data: string;
}
