const { App, ExpressReceiver } = require('@slack/bolt');
const awsServerlessExpress = require('aws-serverless-express');
const Airtable = require('airtable');
const { validateCommand, getParts } = require('./utils');
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

  if (command.text.toLowerCase() === 'show leaderboard') {
    return;
  }

  const {recipient, quantity} = getParts(command.text);

  const isValidCommand = validateCommand(command.text);

  if (!isValidCommand) {
    client.say('Command was invalid.');
    return;
  }
  
  if (quantity > 5) {
    say(`Whoa there, 🤠! That's too many cookies for one day. The max is 5!`);
    return;
  }

  const senderProfile = (await client.users.profile.get({ user: command.user_id })).profile;
  const recipientProfile = (await client.users.profile.get({ user: recipient })).profile;

  // Alter sender
  db('Count')
    .select({filterByFormula: `{Slack ID} = "${command.user_id}"`})
    .eachPage(function page(records) {
      const user = records[0];

      if (!user) {
        db('Count').create({"fields": {
          "Name": senderProfile.real_name_normalized,
          "Slack ID": command.user_id,
          "Cookies Received": 0,
          "Cookies Given": quantity,
        }});
      } else {
        db('Count').update(user.id, { "Cookies Given": user.get('Cookies Given') + quantity });
      }
  });

  // Alter recipient
  db('Count')
    .select({filterByFormula: `{Slack ID} = "${recipient}"`})
    .eachPage(function page(records) {
      const user = records[0];

      if (!user) {
        db('Count').create({"fields": {
          "Name": recipientProfile.real_name_normalized,
          "Slack ID": recipient,
          "Cookies Received": quantity,
          "Cookies Given": 0,
        }});
      } else {
        db('Count').update(user.id, { "Cookies Received": user.get('Cookies Received') + quantity });
      }
  });

  await say(`${command.user_id} is ${command.user_name}`);
})

module.exports.handler = (event, context) => {
  console.log('⚡️ Bolt app is running');
  awsServerlessExpress.proxy(server, event, context);
}
