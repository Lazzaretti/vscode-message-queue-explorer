import { PagedAsyncIterableIterator, PageSettings } from "@azure/core-paging";
import {
  EntitiesResponse,
  ServiceBusAdministrationClient,
  ServiceBusClient,
  ServiceBusReceivedMessage,
  ServiceBusReceiver,
} from "@azure/service-bus";
import {
  IChannelIdentifier,
  IMessageCommand,
  ISubChannelIdentifier,
} from "../../../facade/ConnectionFacade";
import { IMessage } from "../../models/IMessage";
import { IActiveConnection } from "../models/IActiveConnection";
import { IChannel } from "../models/IChannel";
import { ISavableResponse } from "../models/ISavableResponse";
const long = require("long");

export class ServiceBusService implements IActiveConnection {
  private serviceBusClient: ServiceBusClient;
  private serviceBusAdminClient: ServiceBusAdministrationClient;

  constructor(private connectionString: string) {
    this.serviceBusClient = new ServiceBusClient(this.connectionString);
    try {
      this.serviceBusAdminClient = new ServiceBusAdministrationClient(
        this.connectionString
      );
    } catch {
      throw new Error(
        "Managment right is needed -> otherwise queue list is not possible"
      );
    }
  }

  async getSaveableConnection(): Promise<ISavableResponse> {
    const name = this.serviceBusClient.fullyQualifiedNamespace;
    return { name, data: this.connectionString };
  }

  async getChannels(): Promise<IChannel[]> {
    const queuePromise: Promise<IChannel[]> = this.getItemsFromIterator(
      this.serviceBusAdminClient.listQueues()
    ).then((l) =>
      l.map((q) => ({ name: q.name, status: q.status, channelType: "Queue" }))
    );
    const topicPromise: Promise<IChannel[]> = this.getItemsFromIterator(
      this.serviceBusAdminClient.listTopics()
    ).then((l) =>
      l.map(
        (t) =>
          <IChannel>{ name: t.name, status: t.status, channelType: "Topic" }
      )
    );
    const promises = await Promise.all([queuePromise, topicPromise]);
    const channels = promises.flatMap((x) => x);
    await this.updateChannelsRuntimeProperties(channels);
    return channels;
  }

  private async updateChannelsRuntimeProperties(channels: IChannel[]) {
    const queuePromise = channels
      .filter((c) => c.channelType === "Queue")
      .map((q) =>
        this.serviceBusAdminClient
          .getQueueRuntimeProperties(q.name)
          .then((p) => {
            q.deadLetterMessageCount = p.deadLetterMessageCount;
            q.totalMessageCount = p.totalMessageCount;
          })
      );
    const topicPromise = channels
      .filter((c) => c.channelType === "Topic")
      .map((q) =>
        this.serviceBusAdminClient
          .getTopicRuntimeProperties(q.name)
          .then((p) => {
            q.totalMessageCount = p.scheduledMessageCount;
          })
      );
    const promises = await Promise.all([queuePromise, topicPromise]);
    const flatPromises = promises.flatMap((x) => x);
    await Promise.all(flatPromises);
  }

  private async getItemsFromIterator<T extends object>(
    iterator: PagedAsyncIterableIterator<T, EntitiesResponse<T>, PageSettings>
  ): Promise<T[]> {
    const item = await iterator.next();
    if (item.done) {
      return [];
    }
    return [item.value, ...(await this.getItemsFromIterator(iterator))];
  }

  async peekMessages(
    channelIdentifier: ISubChannelIdentifier,
    amount = 50
  ): Promise<IMessage[]> {
    let receiver = null;
    try {
      receiver = this.createReceiver(channelIdentifier);
      const messages = await receiver.peekMessages(amount, {
        fromSequenceNumber: long.fromInt(0),
      });

      return messages.map((m) => ({
        messageId: m.messageId?.toString(),
        contentType: m.contentType,
        subject: m.subject,
        body: m.body,
      }));
    } finally {
      receiver?.close();
    }
  }

  async executeCommandOnMessage(
    messageCommand: IMessageCommand,
    channelIdentifier: ISubChannelIdentifier,
    messageId: string
  ): Promise<any> {
    switch (messageCommand) {
      case "Requeue":
        if (
          channelIdentifier.subType !== "DeadLetter" ||
          channelIdentifier.channelType !== "Queue"
        ) {
          throw new Error("Requeue in only supported for dead-letter queues");
        }
        return await this.requeueMessage(channelIdentifier, messageId);
      case "Delete":
        return await this.deleteMessage(channelIdentifier, messageId);
    }
    throw new Error("command not implemented");
  }

  async requeueMessage(
    channelIdentifier: ISubChannelIdentifier,
    messageId: string
  ) {
    let sender = null;
    let receiver = null;
    try {
      sender = this.serviceBusClient.createSender(channelIdentifier.name);
      receiver = this.createReceiver(channelIdentifier);

      const message = await this.getMessageByIdOrThrow(
        receiver,
        channelIdentifier,
        messageId
      );

      await sender.sendMessages(message);
      await receiver.completeMessage(message);
    } finally {
      receiver?.close();
      sender?.close();
    }
  }

  async deleteMessage(
    channelIdentifier: ISubChannelIdentifier,
    messageId: string
  ) {
    let receiver = null;
    try {
      receiver = this.createReceiver(channelIdentifier);

      const message = await this.getMessageByIdOrThrow(
        receiver,
        channelIdentifier,
        messageId
      );

      await receiver.completeMessage(message);
    } finally {
      receiver?.close();
    }
  }

  private createReceiver(channelIdentifier: ISubChannelIdentifier) {
    return this.serviceBusClient.createReceiver(channelIdentifier.name, {
      subQueueType:
        channelIdentifier.subType === "DeadLetter" ? "deadLetter" : undefined,
    });
  }

  private async getMessageByIdOrThrow(
    receiver: ServiceBusReceiver,
    channelIdentifier: IChannelIdentifier,
    messageId: string
  ): Promise<ServiceBusReceivedMessage> {
    const message = await this.getMessageById(receiver, messageId);
    if (message === null) {
      throw new Error(
        `message ${messageId} is not in ${channelIdentifier.channelType} ${channelIdentifier.name} anymore`
      );
    }
    return message;
  }

  private async getMessageById(
    receiver: ServiceBusReceiver,
    messageId: string
  ): Promise<ServiceBusReceivedMessage | null> {
    for await (let message of receiver.getMessageIterator()) {
      if (message.messageId === messageId) {
        return message;
      }
    }
    return null;
  }

  async close() {
    await this.serviceBusClient.close();
  }
}
