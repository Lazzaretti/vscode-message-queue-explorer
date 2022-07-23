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

export interface IChannel {
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
