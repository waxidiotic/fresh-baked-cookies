const { App, ExpressReceiver } = require('@slack/bolt');
const awsServerlessExpress = require('aws-serverless-express');

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver
});

const server = awsServerlessExpress.createServer(expressReceiver.app);

app.command('/cookies', async ({command, ack, say}) => {
  await ack();

  await say(`${command.text}`);
})

module.exports.handler = (event, context) => {
  console.log('⚡️ Bolt app is running');
  awsServerlessExpress.proxy(server, event, context);
}
