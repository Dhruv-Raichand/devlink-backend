import { SESClient } from '@aws-sdk/client-ses';
// Set the AWS Region.
const REGION = 'eu-north-1';
// Create SES service object.
const sesClient = new SESClient([
  REGION,
  {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
]);

export default sesClient;
// snippet-end:[ses.JavaScript.createclientv3]
