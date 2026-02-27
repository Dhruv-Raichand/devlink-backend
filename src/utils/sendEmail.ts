import { SendEmailCommand } from '@aws-sdk/client-ses';
import sesClient from './sesClient.js';

const createSendEmailCommand = (
  subject: string,
  body: string,
  toAddress: string,
  fromAddress: string
) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `<h1>${body}</h1>`,
        },
        Text: {
          Charset: 'UTF-8',
          Data: 'This is text format',
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [
      /* more items */
    ],
  });
};

const run = async (subject: string, body: string): Promise<any> => {
  const sendEmailCommand = createSendEmailCommand(
    subject,
    body,
    'dhruvraichand70@gmail.com',
    'dhruv@linkdev.online'
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    if (caught instanceof Error && caught.name === 'MessageRejected') {
      const messageRejectedError = caught;
      return messageRejectedError;
    }
    throw caught;
  }
};

// snippet-end:[ses.JavaScript.email.sendEmailV3]
export default run;
