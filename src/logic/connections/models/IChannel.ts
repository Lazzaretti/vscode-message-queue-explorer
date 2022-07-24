import { IChannelIdentifier } from "../../../facade/ConnectionFacade";

export type ChannelStatus =
  | "Active"
  | "Creating"
  | "Deleting"
  | "ReceiveDisabled"
  | "SendDisabled"
  | "Disabled"
  | "Renaming"
  | "Restoring"
  | "Unknown";
export type ChannelType = "Topic" | "Queue";
export type QueueSubType = "Normal" | "DeadLetter";
export type TopicSubType = "Normal";

export interface IChannel extends IChannelIdentifier {
  name: string;
  status: ChannelStatus;
  channelType: ChannelType;
  deadLetterMessageCount?: number;

  /**
   * queue: totalMessageCount
   * topic: scheduledMessageCount
   */
  totalMessageCount?: number;
}
