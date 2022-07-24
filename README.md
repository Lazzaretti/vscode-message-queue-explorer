# Message Queue Explorer Extension for Visual Studio Code

[![Lint and Build](https://github.com/Lazzaretti/vscode-message-queue-explorer/actions/workflows/build-test.yml/badge.svg?branch=main)](https://github.com/Lazzaretti/vscode-message-queue-explorer/actions/workflows/build-test.yml)

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
