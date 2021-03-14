import { NowRequest, NowResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { sendMsg, StandupGroup, Member, About } from './_helpers';

module.exports = async (req: NowRequest, res: NowResponse) => {
  const db = await connectToDatabase();
  const groups = await db.collection('groups').find({}).toArray();

  const reminders = [];
  groups.forEach((group: StandupGroup) => {
    var validMembers = Array.isArray(group.members) && group.members.filter(
      (m: Member) => m && m.about && m.about.id && !m.submitted
    ) || [];

    if(!Array.isArray(validMembers) || !validMembers.length) {
      return;
    }

    var member = validMembers[Math.floor(Math.random() * validMembers.length)];

    reminders.push(
      sendMsg(
        "Hello, you've been selected! Please submit an update. Update is due by 6pm.",
        member.about.id
      )
    );
    reminders.push(
      sendMsg(
        'Na, ez a beszéd!!!!! A kovetkezo ember aki remeljuk fog irni: ' +
          member.about.first_name +
          ' (@' +
          member.about.username +
          '):',
        group.chatId
      )
    );
  });

  await Promise.all(reminders);

  res.json({ status: 200 });
};
