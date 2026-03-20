import { SESClient } from '@aws-sdk/client-ses';

if (!process.env.AWS_REGION) {
  throw new Error('AWS REGION is not present in environment variables');
}

if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY) {
  throw new Error('Missing AWS credentials in environment variables');
}

// Create SES service object.
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

export default sesClient;
// snippet-end:[ses.JavaScript.createclientv3]
