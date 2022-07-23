# Message Queue Explorer Extension for Visual Studio Code

A [Visual Studio Code](https://code.visualstudio.com/) extension to view and interact with Service Bus message queues.

## Features

Currently, Azure Service Bus is supported. With the following features:

- List Queues & Topics including total message count and total dead-letter message count.
- List messages in a specific queue
- List dead-letter message
- Requeue dead-letter messages

## Requirements

You need a Service Bus Connection String with `Manage` claim.
This is needed to list the queues and topics.
