exports.run = async (bot, msg, args) => {
  if (!args.length) {
    throw new Error('You must provide text to space out!')
  }

  let amount = 2
  if (!isNaN(args[0])) {
    amount = parseInt(args[0]);
    (amount < 1) && (amount = 1);
    (amount > 15) && (amount = 15)
    args = args.slice(1)
  }

  return msg.edit(args.join(' '.repeat(amount / 2)).split('').join(' '.repeat(amount)))
}

exports.info = {
  name: 'space',
  usage: 'space [amount] <text>',
  description: 'Spaces out text to look all dramatic n\' stuff'
}
