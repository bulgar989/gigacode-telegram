const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
var fs = require('fs');
require('dotenv').config();
const input = require("input"); // npm i input
const GigaChat = require('gigachat-node').GigaChat;

const sqlite3 = require('sqlite3').verbose();
//const db = new sqlite3.Database(':memory:');
const db = new sqlite3.Database('./database.sqlite');

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
  

  //await client.connect();
/*
  db.serialize(() => {
   // db.run("CREATE TABLE posts (id INTEGER PRIMARY KEY, content TEXT, img string, is_posted boolean, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");

   // db.run("INSERT INTO posts (content, img_link, is_posted) VALUES ('Laptop', 'teststst', 1)");

    const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
        console.log(row.id + ": " + row.info);
    });
    
  });

  db.close();
  */
  
  console.log("You should now be connected.");
  //console.log(client.session.save()); // Save this string to avoid logging in again
  //await client.sendMessage("me", { message: "Hello!" });

  client.addEventHandler(async (update) => {
    if(update.message?.peerId?.channelId){
      //console.log(update)
        if(update.message?.message !== undefined){

          console.log(update)
          console.log(update.message?.message)
          console.log(update.message?.media?.photo?.id)

          let img = ''
          if(update.message?.media){
            const buffer = await client.downloadMedia(update.message?.media, {
              workers: 1,
            });
            img = `img/${update.message?.media?.photo?.id}_${update.message?.peerId?.channelId}.jpg`;
            await fs.writeFileSync(img, buffer);
          }


          db.run(`INSERT INTO posts (content, img_link, is_posted) VALUES ('${update.message?.message}', '${img}', 0)`);
          
          /*
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

          */

        }else{
          console.log('sdfsdf')
        }
    }
  });

})();
