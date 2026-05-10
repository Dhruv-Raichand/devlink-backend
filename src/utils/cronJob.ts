import cron from 'node-cron';
import ConnectionModel from '../models/connection.js';
import sendEmail from './sendEmail.js';
import { digestEmail } from './emailTemplates.js';
import { subDays, startOfDay, endOfDay } from 'date-fns';

cron.schedule(
  '0 8 * * *',
  async () => {
    try {
      const yesterday = subDays(new Date(), 1);

      const pendingRequests = await ConnectionModel.find({
        status: 'interested',
        createdAt: {
          $gte: startOfDay(yesterday),
          $lt: endOfDay(yesterday),
        },
      }).populate<{
        toUserId: { _id: any; emailId: string; firstName: string };
      }>('toUserId', 'emailId firstName');

      const recipientMap = new Map<
        string,
        { firstName: string; count: number }
      >();

      for (const req of pendingRequests) {
        const { emailId, firstName } = req.toUserId;
        if (!emailId) continue;

        const existing = recipientMap.get(emailId);
        if (existing) {
          existing.count += 1;
        } else {
          recipientMap.set(emailId, { firstName, count: 1 });
        }
      }

      console.log(`Digest: sending to ${recipientMap.size} users`);

      for (const [email, { firstName, count }] of recipientMap) {
        try {
          await sendEmail({
            to: email,
            subject: `You have ${count} new connection request${count > 1 ? 's' : ''} on DevLink`,
            html: digestEmail(firstName, count),
          });
          console.log(`Digest sent to ${email}`);
        } catch (err) {
          console.error(`Digest failed for ${email}:`, err);
        }
      }
    } catch (err) {
      console.error('Cron job failed:', err);
    }
  },
  { timezone: 'Asia/Kolkata' }
);
