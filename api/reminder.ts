import { NowRequest, NowResponse } from "@vercel/node";
import { connectToDatabase } from "./_connectToDatabase";
import { sendMsg, StandupGroup, Member, About } from "./_helpers";

module.exports = async (req: NowRequest, res: NowResponse) => {
  const db = await connectToDatabase();
  const groups = await db.collection("groups").find({}).toArray();


  const reminders = []
  groups.forEach((group: StandupGroup) => {
    var item = group.members[Math.floor(Math.random() * group.members.length)];
    var items = [item];

    items.forEach((member: Member) => {
      if (member.submitted === false) {
        reminders.push(sendMsg("Hello, you've been selected! Please submit an update. Update is due by 6pm.", member.about.id))
      }
    });
  });

  await Promise.all(reminders)

  res.json({ status: 200 });

};
