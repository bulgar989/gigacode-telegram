const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
var fs = require('fs');
require('dotenv').config();
const input = require("input"); // npm i input
const GigaChat = require('gigachat-node').GigaChat;

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION); // fill this later with the value from session.save()

const clientGiga = new GigaChat(
    clientSecretKey=process.env.CLIENT_SECRET_KEY, 
    isIgnoreTSL=true,
    isPersonal=true,
    autoRefreshToken=true
);

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  console.log(client.session.save()); // Save this string to avoid logging in again
  //await client.sendMessage("me", { message: "Hello!" });

  client.addEventHandler(async (update) => {
    if(!isNaN(Number(update.userId))){
        if(update.message !== undefined){
            await clientGiga.createToken();

            const responce = await clientGiga.completion({
                "model":"GigaChat:latest",
                "messages": [
                    {
                        role:"user",
                        content: update.message
                    }
                ]
            });

            await client.sendMessage(Number(update.userId), { 
                message: responce.choices[0].message?.image ? '' : responce.choices[0].message.content,
                file: responce.choices[0].message?.image,
            });

            if(responce.choices[0].message?.image) fs.unlinkSync(responce.choices[0].message?.image);

        }
    }
  });

})();
