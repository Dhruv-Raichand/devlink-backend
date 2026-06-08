import { Worker } from 'bullmq';
import sendEmail from '../utils/sendEmail.js';
import { digestEmail, verificationEmail } from '../utils/emailTemplates.js';

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};

const worker = new Worker(
  'emailQueue',
  async (job) => {
    switch (job.name) {
      case 'sendVerificationEmail': {
        const { to, firstName, verifyToken } = job.data;
        await sendEmail({
          to: to,
          subject: 'Verify your DevLink email',
          html: verificationEmail(
            firstName,
            `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`
          ),
        });
        break;
      }

      case 'sendDigest': {
        const { to, firstName, count } = job.data;
        await sendEmail({
          to,
          subject: `You have ${count} new connection request${count > 1 ? 's' : ''} on DevLink`,
          html: digestEmail(firstName, count),
        });
        break;
      }

      default:
        throw new Error(`Unknown job type ${job.name}`);
    }
  },
  {
    connection,
    limiter: {
      max: 1,
      duration: 600,
    },
    concurrency: 1,
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  if (!job) {
    console.error('Unknown job failed:', err.message);
    return;
  }

  console.error(`Job ${job.id} failed: ${err.message}`);
});
