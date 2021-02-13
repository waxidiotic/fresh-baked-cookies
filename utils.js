const COMMAND_REGEX = /(give|send)\s(?:<@(.+(?=\|)))(?:.*)\s([1-5])/g;

const validateCommand = async (str) => {
  return COMMAND_REGEX.test(str);
};

const getRecipient = () => {
  // parse user id from <USER_ID|USER_NAME> where the | and USER_NAME may NOT be present
}

module.exports = { validateCommand, getRecipient };