const COMMAND_REGEX = /(give|send)\s(?:<@(.+(?=\|)))(?:.*)\s([1-9])/g;

const validateCommand = (str) => {
  return COMMAND_REGEX.test(str);
};

const getParts = (str) => {
  const [_command, action, recipient, quantity] = [...str.matchAll(COMMAND_REGEX)][0];
  console.log(recipient, quantity);
  return { action, recipient, quantity: Number(quantity) };
}

module.exports = { validateCommand, getParts };