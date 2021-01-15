import { NowRequest, NowResponse } from "@vercel/node";
import { connectToDatabase } from "./_connectToDatabase";
import { sendMsg, StandupGroup, Member, About } from "./_helpers";
const axios = require('axios')

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
