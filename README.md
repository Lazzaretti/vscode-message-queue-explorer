# Message Queue Explorer Extension for Visual Studio Code

[![Build and Test](https://github.com/Lazzaretti/vscode-message-queue-explorer/actions/workflows/build-test.yml/badge.svg?branch=main)](https://github.com/Lazzaretti/vscode-message-queue-explorer/actions/workflows/build-test.yml)

A [Visual Studio Code](https://code.visualstudio.com/) extension to view and interact with Service Bus message queues.

## Features

Currently, Azure Service Bus is supported. With the following features:

- List Queues & Topics including total message count and total dead-letter message count.
- List messages in a specific queue
- List dead-letter message
- Requeue dead-letter messages
- Delete message from queue

## Requirements

You need a Service Bus Connection String with `Manage` claim.
This is needed to list the queues and topics.

## Release Process

1. bump the version in [package.json](./package.json) and commit it to the main branch
2. create a release with a tag with the verison number you commited
