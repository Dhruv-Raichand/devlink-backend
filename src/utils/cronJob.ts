import cron from 'node-cron';
import ConnectionModel from '../models/connection.js';
import sendEmail from './sendEmail.js';
import { subDays, startOfDay, endOfDay } from 'date-fns';

cron.schedule(
  '0 8 * * *',
  async () => {
    // Send emails to all  people who got requests the previous day
    try {
      const yesterday = subDays(new Date(), 1);

      const yesterdayStart = startOfDay(yesterday);
      const yesterdayEnd = endOfDay(yesterday);

      const pendingRequests = await ConnectionModel.find({
        status: 'interested',
        createdAt: {
          $gte: yesterdayStart,
          $lt: yesterdayEnd,
        },
      }).populate('toUserId');

      const listOfEmails = [
        ...new Set(pendingRequests.map((req: any) => req.toUserId.emailId)),
      ];
      console.log(listOfEmails);
      for (const email of listOfEmails) {
        try {
          const res = await sendEmail(
            `New Friend Requests pending for ${email}`,
            'There are so many friend requests pending, Please login to the LinkDev.online and accept or reject requests'
          );
          console.log(res);
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
  {
    timezone: 'Asia/Kolkata', // change to your timezone
  }
);
