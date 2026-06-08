import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};

export const emailQueue = new Queue('emailQueue', { connection });

const defaultEmailJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: 1000,
  removeOnFail: 5000,
};

export async function addDigestJob(
  to: string,
  firstName: string,
  count: number
) {
  await emailQueue.add(
    'sendDigest',
    { to, firstName, count },
    defaultEmailJobOptions
  );
}

export async function addVerificationEmailJob(
  to: string,
  firstName: string,
  verifyToken: string
) {
  await emailQueue.add(
    'sendVerificationEmail',
    { to, firstName, verifyToken },
    defaultEmailJobOptions
  );
}

export async function addWelcomeEmailJob(to: string, firstName: string) {
  await emailQueue.add(
    'sendWelcomeEmail',
    { to, firstName },
    defaultEmailJobOptions
  );
}
