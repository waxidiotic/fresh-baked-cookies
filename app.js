const { App, ExpressReceiver } = require('@slack/bolt');
const awsServerlessExpress = require('aws-serverless-express');
const Airtable = require('airtable');
const { validateCommand } = require('./utils');
const db = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base('appAbE6sLr0xGaNw9');

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver
});

const server = awsServerlessExpress.createServer(expressReceiver.app);

app.command('/cookies', async ({command, client, ack, say}) => {
  await ack();

  const sender = (await client.users.profile.get({ user: command.user_id })).profile;

  const splitCommand = command.text.split(' ');

  if (splitCommand.length < 3) {
    // error out whole thing
    return;
  }

  const [action, recipient, quantity] = splitCommand;

  // validate items

  console.log(await validateCommand(command.text));

  // get recipient

  // get records from db for sender
  //    - if no record, create new one with <QUANTITY> 'Cookies Given' and timestamp
  //    - if record, update, incrementing 'Cookies Given' by <QUANTITY> and updating timestamp

  // get records from db for recipient
  //    - same as sender, but with 'Cookies Received'

  // const {profile} = await client.users.profile.get({user: command.user_id});
  // db('Count').select({filterByFormula: `{Slack ID} = "${command.user_id}"`}).eachPage(function page(records) {
  //   const user = records[0];
    
  //   if (!user) {
  //     console.log(`USER NOT FOUND. CREATING.`)
  //     db('Count').create({"fields": {
  //       "Name": profile.real_name_normalized,
  //       "Slack ID": command.user_id,
  //       "Cookies Received": 0,
  //       "Cookies Given": 1
  //     }})
  //   } else {
  //     console.log(`USER FOUND. UPDATING.`)
  //     db('Count').update(user.id, { "Cookies Given": user.get('Cookies Given') + 1 })
  //   }
  // });

  await say(`${command.user_id} is ${command.user_name}`);
})

module.exports.handler = (event, context) => {
  console.log('⚡️ Bolt app is running');
  awsServerlessExpress.proxy(server, event, context);
}
