import { NowRequest, NowResponse } from "@vercel/node";
import { connectToDatabase } from "./_connectToDatabase";
import { sendMsg, StandupGroup, Member, About } from "./_helpers";
const axios = require('axios')

const standupTemplate = `Welcome! Simply post your standup here and it will automatically be posted to your group at 10m. You will recieve a few reminders if you do not submit your standup before 8am the day of.
Please use the following template for your standups:
Yesterday - 

Today -

Roadblocks - `;

const leaveStandupGroup = async (
  chatId: number,
  userId: number,
  about: About,
  messageId: number
) => {
  const db = await connectToDatabase();
  const removedUserFromGroup = await db.collection("groups").updateOne(
    {
      chatId,
    },
    { $pull: { members: { "about.id": userId } } }
  );
  if (removedUserFromGroup.modifiedCount) {
    return sendMsg("You have left the group.", chatId, messageId);
  }

  return sendMsg(
    "You aren't currently in a group. Join with /join !",
    chatId,
    messageId
  );
};

const startBot = async (userId: number) => {
  const db = await connectToDatabase();

  await db.collection("groups").updateMany(
    { "members.about.id": userId },
    {
      $set: {
        "members.$[elem].botCanMessage": true,
      },
    },
    { arrayFilters: [{ "elem.about.id": userId }] }
  );
};

const sendAboutMessage = async (
  chatId: number,
  userId: number,
  about: About,
  messageId: number
) => {
  const db = await connectToDatabase();
  
  const group = await db.collection("groups").findOne({ chatId });
  if (group) {
  return sendMsg(JSON.stringify(group), chatId, messageId)
  }
  return sendMsg('There is no group for this channel. Create a group with /join', chatId, messageId)
};


const submitStandup = async (
  chatId: number,
  userId: number,
  about: About,
  messageId: number,
  message
) => {

  // chatter sent bot a message. 
  // only save their update if its that persons turn. if it's not, say its not their turn and tell them who's turn it is. 

  // access database
  const db = await connectToDatabase();
  const todayPerson = await db.collection("updates")
  // grab todaysPerson
  // if chatter.id is same as todaysPersons.id
  // 

  const addUpdate = await db.collection("groups").updateOne(
  { "members.about.id": userId },
  {
    $set: {
        "members.$[elem].submitted": true,
        "members.$[elem].botCanMessage": true,
        "members.$[elem].lastSubmittedAt": Date.now(),
        "members.$[elem].update": message,
      },
    },
    { arrayFilters: [{ "elem.about.id": userId }] }
  );

  if (addUpdate.modifiedCount) {
    return sendMsg("It is not your turn to post.", chatId, messageId, true);
  }
  return sendMsg(
    "You aren't currently part of a standup group. Add this bot to your group, then send /join@TortenetekBot message in the group to create a standup group",
    chatId,
    messageId
  );
};

const addToStandupGroup = async (
  chatId: number,
  userId: number,
  about: About,
  messageId: number
) => {
  const member: Member = {
    submitted: false,
    botCanMessage: false,
    lastSubmittedAt: "",
    update: "",
    about,
  };
  const db = await connectToDatabase();

  const userExistsInGroup = await db.collection("groups").findOne({
    chatId,
    "members.about.id": userId,
  });
  if (userExistsInGroup) {
    return sendMsg("You are already in the group.", chatId, messageId);
  }

  const groupExists = await db.collection("groups").findOne({ chatId });
  if (!groupExists) {
    const group: StandupGroup = {
      chatId,
      updateTime: "",
      members: [member],
    };
    db.collection("groups").insertOne(group);
  } else {
    db.collection("groups").updateOne(
      { chatId },
      { $push: { members: member } }
    );
  }

  return sendMsg(
    "You've been added to the Tortenetek group! Send me a private message @TortenetekBot to receive reminders.",
    chatId,
    messageId
  );
};

export default async (req: NowRequest, res: NowResponse) => {
  const { body } = req;

  const { message } = body || {};
  const { chat, entities, text, message_id, from } = message || {};

  const url_regex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm
  const matches = text.match(url_regex);
  // if(matches !== null){
    
  //   try {
  //     const smmry_api = 'https://api.smmry.com/?SM_API_KEY=339EB2FA9C&SM_URL=' + matches[0]
  //     const response = await axios.get(smmry_api)
  //     const r = await sendMsg(response.data.sm_api_content, chat.id, message_id);  
  //     return res.json({ status: r.status });
  //   } catch (error) {
  //     const r = await sendMsg(JSON.stringify(error), chat.id, message_id);  
  //     return res.json({ status: r.status });
  //   }
  // }
  // else {
  //   const r = await sendMsg("no url", chat.id, message_id);  
  //   return res.json({ status: r.status });
  // }
  const r = await sendMsg("no url", chat.id, message_id);  
  return res.json({ status: r.status });

};
