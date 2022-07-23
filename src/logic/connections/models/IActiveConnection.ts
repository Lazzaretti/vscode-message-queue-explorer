import { IMessageCommand } from "../../../facade/ConnectionFacade";
import { IMessage } from "../../models/IMessage";
import { IChannel, QueueSubType } from "./IChannel";
import { ISavableResponse } from "./ISavableResponse";

export interface IActiveConnection {
  getSaveableConnection(): Promise<ISavableResponse>;
  peekMessages(
    queueName: string,
    queueSubType: QueueSubType,
    amount?: number
  ): Promise<IMessage[]>;
  getChannels(): Promise<IChannel[]>;
  executeCommandOnMessage(
    messageCommand: IMessageCommand,
    channelName: string,
    messageId: string
  ): Promise<any>;
  close(): Promise<void>;
}
