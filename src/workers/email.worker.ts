import { Worker } from 'bullmq';
import sendEmail from '../utils/sendEmail.js';
import { digestEmail } from '../utils/emailTemplates.js';

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};

const worker = new Worker(
  'emailQueue',
  async (job) => {
    const { to, firstName, count } = job.data;
    await sendEmail({
      to,
      subject: `You have ${count} new connection request${count > 1 ? 's' : ''} on DevLink`,
      html: digestEmail(firstName, count),
    });
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
