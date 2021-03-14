import { NowRequest, NowResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { sendMsg, StandupGroup, Member, About } from './_helpers';

module.exports = async (req: NowRequest, res: NowResponse) => {
  const db = await connectToDatabase();

  const addUpdate = async () => {
    await db.collection('groups').updateMany(
      {},
      {
        $set: {
          'members.$[elem].submitted': false,
          'members.$[elem].update': '',
        },
      },
      { arrayFilters: [{ 'elem.submitted': true }] }
    );
  };
  const groups = await db.collection('groups').find({}).toArray();

  const sentStandup = [];
  groups.forEach((group: StandupGroup) => {
    var validMembers = group.members.filter(
      (m: Member) => m && m.about && m.about.id && m.update
    );
    if (!validMembers || !validMembers.length) {
      sentStandup.push(
        sendMsg(
          'Na, ez NEM a beszéd!! Senki irt egy updateot!! ',
          group.chatId
        )
      );
    }
    validMembers.forEach((member: Member) => {
      sentStandup.push(
        sendMsg(
          'Na, ez a beszéd!! ' +
            member.about.first_name +
            ' (@' +
            member.about.username +
            '): \n' +
            member.update,
          group.chatId
        )
      );
    });
  });

  await Promise.all(sentStandup);
  await addUpdate();

  res.json({ status: 200 });
};
