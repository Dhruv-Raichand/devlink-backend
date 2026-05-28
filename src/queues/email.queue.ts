import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};

export const emailQueue = new Queue('emailQueue', { connection });

export async function addDigestJob(
  to: string,
  firstName: string,
  count: number
) {
  await emailQueue.add(
    'sendDigest',
    { to, firstName, count },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    }
  );
}
