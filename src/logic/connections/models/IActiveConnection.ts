import {
  IMessageCommand,
  ISubChannelIdentifier,
} from "../../../facade/ConnectionFacade";
import { IMessage } from "../../models/IMessage";
import { IChannel } from "./IChannel";
import { ISavableResponse } from "./ISavableResponse";

export interface IActiveConnection {
  getSaveableConnection(): Promise<ISavableResponse>;
  peekMessages(
    channelIdentifier: ISubChannelIdentifier,
    amount?: number
  ): Promise<IMessage[]>;
  getChannels(): Promise<IChannel[]>;
  executeCommandOnMessage(
    messageCommand: IMessageCommand,
    channelIdentifier: ISubChannelIdentifier,
    messageId: string
  ): Promise<any>;
  close(): Promise<void>;
}
