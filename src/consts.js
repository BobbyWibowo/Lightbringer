global.PROGRESS = '🔄\u2000'
global.SUCCESS = '✅\u2000'
global.FAILURE = '❌\u2000'

exports.fullDateFormat = 'dddd, MMMM Do YYYY @ h:mm:ss a'
exports.mediumDateFormat = 'ddd, MMM Do YYYY @ h:mm:ss a'
exports.shortDateFormat = 'MMM Do, YYYY'

exports.emojiMap = {
  a: ['🇦', '🅰'],
  b: ['🇧', '🅱'],
  c: '🇨',
  d: '🇩',
  e: '🇪',
  f: '🇫',
  g: '🇬',
  h: '🇭',
  i: ['🇮', 'ℹ'],
  j: '🇯',
  k: '🇰',
  l: '🇱',
  m: ['🇲', 'Ⓜ'],
  n: '🇳',
  o: ['🇴', '🅾'],
  p: ['🇵', '🅿'],
  q: '🇶',
  r: '🇷',
  s: '🇸',
  t: '🇹',
  u: '🇺',
  v: '🇻',
  w: '🇼',
  x: ['🇽', '❌'],
  y: '🇾',
  z: '🇿',
  0: '0⃣',
  1: '1⃣',
  2: '2⃣',
  3: '3⃣',
  4: '4⃣',
  5: '5⃣',
  6: '6⃣',
  7: '7⃣',
  8: '8⃣',
  9: '9⃣',
  '#': '#⃣',
  '*': '*⃣',
  '!': '❗',
  '?': '❓'
}

/* These guilds contain 3 extra sets of alphabet emojis and 2
 * extra sets of numerical emojis. Unfortunately, they are Nitro
 * only. Contact me for invites if you want to join anyways… */
const eemConfig = {
  guilds: [
    {
      id: '331766439356661761',
      format: /^([a-z0-9])_$/i
    },
    {
      id: '331766529190395904',
      format: /^([a-z0-9])_$/i
    }
  ],
  expandedEmojis: 0,
  expandedGuilds: []
}

const expandEmojiMap = () => {
  if (!eemConfig || !eemConfig.guilds || !eemConfig.guilds.length) {
    return
  }

  for (const g of eemConfig.guilds) {
    if (!g || !g.id || !g.format || eemConfig.expandedGuilds.includes(g.id)) {
      continue
    }

    const guild = bot.guilds.get(g.id)
    if (!guild) {
      continue
    }

    // NOTE: Call the function again in 2.5s if the guild is not yet ready
    if (!guild.available) {
      return setTimeout(() => {
        expandEmojiMap()
      }, 2500)
    }

    const emojis = guild.emojis
    if (!emojis || !emojis.size) {
      continue
    }

    let expanded = false

    for (const e of emojis.array()) {
      const match = e.name.match(g.format)
      if (!match || !match[1]) {
        continue
      }

      const id = match[1].toLowerCase()
      if (!this.emojiMap[id]) {
        continue
      }

      const type = typeof this.emojiMap[id]
      if (type === 'object') {
        this.emojiMap[id].splice(1, 0, e.id)
      } else if (type === 'string') {
        this.emojiMap[id] = [this.emojiMap[id], e.id]
      }

      expanded = true
      eemConfig.expandedEmojis++
    }

    if (expanded) {
      eemConfig.expandedGuilds.push(g.id)
    }
  }

  const e = eemConfig.expandedEmojis
  const g = eemConfig.expandedGuilds.length

  if (config.statusChannel && e && g) {
    bot.channels.get(config.statusChannel).send(`${SUCCESS}The bot successfully expanded emojis map with \`${e}\` ` +
      `emoji${e !== 1 ? 's' : ''} from \`${g}\` guild${g !== 1 ? 's' : ''}.`)
  }
}

expandEmojiMap()

exports.flippedChars = {
  0: '0',
  1: 'Ɩ',
  2: 'ᄅ',
  3: 'Ɛ',
  4: 'ㄣ',
  5: 'ϛ',
  6: '9',
  7: 'ㄥ',
  8: '8',
  9: '6',
  a: 'ɐ',
  b: 'q',
  c: 'ɔ',
  d: 'p',
  e: 'ǝ',
  f: 'ɟ',
  g: 'ƃ',
  h: 'ɥ',
  i: 'ᴉ',
  j: 'ɾ',
  k: 'ʞ',
  m: 'ɯ',
  n: 'u',
  r: 'ɹ',
  t: 'ʇ',
  v: 'ʌ',
  w: 'ʍ',
  y: 'ʎ',
  A: '∀',
  C: 'Ɔ',
  E: 'Ǝ',
  F: 'Ⅎ',
  G: 'פ',
  H: 'H',
  I: 'I',
  J: 'ſ',
  L: '˥',
  M: 'W',
  N: 'N',
  P: 'Ԁ',
  T: '┴',
  U: '∩',
  V: 'Λ',
  Y: '⅄',
  '.': '˙',
  ',': '\'',
  '\'': ',',
  '"': ',,',
  '`': ',',
  '?': '¿',
  '!': '¡',
  '[': ']',
  ']': '[',
  '(': ')',
  ')': '(',
  '{': '}',
  '}': '{',
  '<': '>',
  '>': '<',
  '&': '⅋',
  _: '‾',
  '∴': '∵',
  '⁅': '⁆'
}

exports.foods = [
  '🍪', '🍣', '🍟', '🍕', '🍚', '🍇', '🍓', '🍔', '🍰', '🍄', '🍡', '🍛',
  '🌵', '🍜', '🌽', '🍶', '🍆', '🍌', '🍬', '🍋', '🍹', '🍝', '🍮', '🎂',
  '🍏', '🍈', '🍠', '☕', '🍺', '🍷', '🍥', '🥚', '🍦', '🍭', '🍊', '🍉',
  '🍞', '🍍', '🍘', '🍧', '💩'
]

exports.clocks = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚']

exports.insults = [
  '@ Yo Mama so fat she sued Xbox 360 for guessing her weight.',
  '@ You\'re so fat that when you were diagnosed with a flesh eating bacteria - the doctors gave you 87 years to live.',
  '@ You\'re so fat you\'ve got more chins than a Hong Kong phone book.',
  '@ Yo Mama so fat she\'s on both sides of the family.',
  '@ Yo Mama so fat that even Dora couldn\'t explore her.',
  '@ Yo Mama so fat that she doesn\'t need the internet; she\'s already world wide.',
  '@ You\'re so fat that when you farted you started global warming.',
  '@ You\'re so fat the back of your neck looks like a pack of hot-dogs.',
  '@ You\'re so fat that when you fell from your bed you fell from both sides.',
  '@ You\'re so fat when you get on the scale it says "To be continued."',
  '@ You\'re so fat when you go swimming the whales start singing "We Are Family".',
  '@ You\'re so fat when you stepped on the scale, Buzz Lightyear popped out and said "To infinity and beyond!"',
  '@ You\'re so fat when you turn around, people throw you a welcome back party.',
  '@ You\'re so fat when you were in school you sat by everybody.',
  '@ You\'re so fat when you went to the circus the little girl asked if she could ride the elephant.',
  '@ You\'re so fat when you go on an airplane, you have to pay baggage fees for your ass.',
  '@ You\'re so fat whenever you go to the beach the tide comes in.',
  '@ You\'re so fat I could slap your butt and ride the waves.',
  '@ You\'re so fat I\'d have to grease the door frame and hold a Twinkie on the other side just to get you through.',
  '@ Yo Mama so dumb I told her Christmas was around the corner and she went looking for it.',
  '@ You\'re so dumb it took you 2 hours to watch 60 minutes.',
  '@ Yo Mama so dumb she bought tickets to Xbox Live.',
  '@ You\'re so dumb that you thought The Exorcist was a workout video.',
  '@ You\'re so ugly that you went to the salon and it took 3 hours just to get an estimate.',
  '@ is so ugly that even Scooby Doo couldn\'t solve that mystery.',
  '@ What is the weighted center between Planet X and Planet Y? Oh it\'s YOU!',
  '@ 🍆 🍆 🍆',
  '@ Your birth certificate is an apology letter from the condom factory.',
  '@ I wasn\'t born with enough middle fingers to let you know how I feel about you.',
  '@ must have been born on a highway because that\'s where most accidents happen.',
  'I\'m jealous of all the people that haven\'t met @.',
  '@ I bet your brain feels as good as new, seeing that you never use it.',
  '@ I\'m not saying I hate you, but I would unplug your life support to charge my phone.',
  '@ You\'re so ugly, when your mom dropped you off at school she got a fine for littering.',
  '@ You bring everyone a lot of joy, when you leave the room.',
  '@ What\'s the difference between you and eggs? Eggs get laid and you don\'t.',
  '@ You\'re as bright as a black hole, and twice as dense.',
  '@ I tried to see things from your perspective, but I couldn\'t seem to shove my head that far up my ass.',
  '@ Two wrongs don\'t make a right, take your parents as an example.',
  '@ You\'re the reason the gene pool needs a lifeguard.',
  '@ If laughter is the best medicine, your face must be curing the world.',
  '@ You\'re so ugly, when you popped out the doctor said "Aww what a treasure" and your mom said ' +
    '"Yeah, lets bury it."',
  '@ I have neither the time nor the crayons to explain this to you.',
  '@ You have two brains cells, one is lost and the other is out looking for it.',
  '@ How many times do I have to flush to get rid of you?',
  '@ I don\'t exactly hate you, but if you were on fire and I had water, I\'d drink it.',
  '@ You shouldn\'t play hide and seek, no one would look for you.',
  '@ Some drink from the fountain of knowledge; you only gargled.',
  '@ Roses are red violets are blue, God made me pretty, what happened to you?',
  '@ It\'s better to let someone think you are an Idiot than to open your mouth and prove it.',
  '@ Somewhere out there is a tree, tirelessly producing oxygen so you can breathe. I think you owe it an apology.',
  '@ The last time I saw a face like yours I fed it a banana.',
  '@ The only way you\'ll ever get laid is if you crawl up a chicken\'s ass and wait.',
  '@ Which sexual position produces the ugliest children? Ask your mother.',
  '@ If you really want to know about mistakes, you should ask your parents.',
  '@ At least when I do a handstand my stomach doesn\'t hit me in the face.',
  '@ If I gave you a penny for your thoughts, I\'d get change.',
  'If I were to slap @, it would be considered animal abuse.',
  '@ Do you know how long it takes for your mother to take a crap? Nine months.',
  '@ What are you going to do for a face when the baboon wants his butt back?',
  'Well I could agree with @, but then we\'d both be wrong.',
  '@ You\'re so fat, you could sell shade.',
  '@ It looks like your face caught on fire and someone tried to put it out with a hammer.',
  '@ You\'re not funny, but your life, now that\'s a joke.',
  '@ You\'re so fat the only letters of the alphabet you know are KFC.',
  '@ Oh my God, look at you. Was anyone else hurt in the accident?',
  '@ What are you doing here? Did someone leave your cage open?',
  '@ You\'re so ugly, the only dates you get are on a calendar.',
  '@ I can explain it to you, but I can\'t understand it for you.',
  '@ You are proof that God has a sense of humor.',
  '@ If you spoke your mind, you\'d be speechless.',
  '@ Why don\'t you check eBay and see if they have a life for sale.',
  '@ If I wanted to hear from an asshole, I\'d fart.',
  '@ You\'re so fat you need cheat codes to play Wii Fit',
  '@ You\'re so ugly, when you got robbed, the robbers made you wear their masks.',
  '@ Do you still love nature, despite what it did to you?',
  '@ You are proof that evolution CAN go in reverse.',
  '@ I\'ll never forget the first time we met, although I\'ll keep trying.',
  '@ Your parents hated you so much your bath toys were an iron and a toaster',
  '@ Don\'t feel sad, don\'t feel blue, Frankenstein was ugly too.',
  '@ You\'re so ugly, you scared the crap out of the toilet.',
  '@ It\'s kinda sad watching you attempt to fit your entire vocabulary into a sentence.',
  '@ I fart to make you smell better.',
  '@ You\'re so ugly you make blind kids cry.',
  '@ You\'re a person of rare intelligence. It\'s rare when you show any.',
  '@ You\'re so fat, when you wear a yellow rain coat people scream \'\'taxi\'\'.',
  '@ I heard you went to a haunted house and they offered you a job.',
  '@ You look like a before picture.',
  '@ If your brain was made of chocolate, it wouldn\'t fill an M&M.',
  '@ Aww, it\'s so cute when you try to talk about things you don\'t understand.',
  '@ I heard your parents took you to a dog show and you won.',
  '@ You stare at frozen juice cans because they say, "concentrate".',
  '@ You\'re so stupid you tried to wake a sleeping bag.',
  '@ Am I getting smart with you? How would you know?',
  '@ We all sprang from apes, but you didn\'t spring far enough.',
  '@ I\'m no proctologist, but I know an asshole when I see one.',
  '@ When was the last time you could see your whole body in the mirror?',
  '@ You must have a very low opinion of people if you think they are your equals.',
  '@ So, a thought crossed your mind? Must have been a long and lonely journey.',
  '@ You\'re the best at all you do - and all you do is make people hate you.',
  '@ Looks like you fell off the ugly tree and hit every branch on the way down.',
  '@ Looks aren\'t everything; in your case, they aren\'t anything.',
  '@ You have enough fat to make another human.',
  '@ You\'re so ugly, when you threw a boomerang it didn\'t come back.',
  '@ You\'re so fat a picture of you would fall off the wall!',
  '@ Your hockey team made you goalie so you\'d have to wear a mask.',
  '@ Ordinarily people live and learn. You just live.',
  '@ Did your parents ever ask you to run away from home?',
  '@ I heard you took an IQ test and they said your results were negative.',
  '@ You\'re so ugly, you had tinted windows on your incubator.',
  '@ Don\'t you need a license to be that ugly?',
  '@ I\'m not saying you\'re fat, but it looks like you were poured into your clothes and someone forgot to say "when"',
  '@ I\'ve seen people like you, but I had to pay admission!',
  '@ I hear the only place you\'re ever invited is outside.',
  '@ Keep talking, someday you\'ll say something intelligent!',
  '@ You couldn\'t pour water out of a boot if the instructions were on the heel.',
  '@ Even if you were twice as smart, you\'d still be stupid!',
  '@ You\'re so fat, you have to use a mattress as a maxi-pad.',
  '@ I may be fat, but you\'re ugly, and I can lose weight.',
  '@ I was pro life before I met you.',
  '@ What\'s the difference between you and Hitler? Hitler knew when to kill himself.',
  '@ You\'re so fat, your double chin has a double chin.',
  '@ If ignorance is bliss, you must be the happiest person on earth.',
  '@ You\'re so stupid, it takes you an hour to cook minute rice.',
  '@ Is that your face? Or did your neck just throw up?',
  '@ You\'re so ugly you have to trick or treat over the phone.',
  '@ I\'d hit you but we don\'t hit girls around here.',
  '@ Dumbass.',
  '@ Bitch.',
  '@ I\'d give you a nasty look but you\'ve already got one.',
  '@ If I wanted a bitch, I\'d have bought a dog.',
  '@ Scientists say the universe is made up of neutrons, protons and electrons. They forgot to mention morons.',
  '@ Why is it acceptable for you to be an idiot but not for me to point it out?',
  '@ Did you know they used to be called "Jumpolines" until your mum jumped on one?',
  '@ You\'re not stupid; you just have bad luck when thinking.',
  '@ I thought of you today. It reminded me to take the garbage out.',
  '@ I\'m sorry I didn\'t get that - I don\'t speak idiot.',
  '@ Hey, your village called \u2013 they want their idiot back.',
  '@ I just stepped in something that was smarter than you\u2026 and smelled better too.',
  '@ You\'re so fat that at the zoo the elephants started throwing you peanuts.',
  '@ You\'re so fat every time you turn around, it\'s your birthday.',
  '@ You\'re so fat your idea of dieting is deleting the cookies from your internet cache.',
  '@ You\'re so fat your shadow weighs 35 pounds.',
  '@ You\'re so fat I could tell you to haul ass and you\'d have to make two trips.',
  '@ You\'re so fat I took a picture of you at Christmas and it\'s still printing.',
  '@ You\'re so fat I tried to hang a picture of you on my wall, and my wall fell over.',
  '@ You\'re so fat Mount Everest tried to climb you.',
  '@ You\'re so fat you can\'t even jump to a conclusion.',
  '@ You\'re so fat you can\'t fit in any timeline.',
  '@ You\'re so fat you can\'t fit in this joke.',
  '@ You\'re so fat you don\'t skinny dip, you chunky dunk.',
  '@ You\'re so fat you fell in love and broke it.',
  '@ You\'re so fat you go to KFC and lick other peoples\' fingers.',
  '@ You\'re so fat you got arrested at the airport for ten pounds of crack.',
  '@ You\'re so fat you\'d have to go to Sea World to get baptized.',
  '@ You\'re so fat you have your own zip code.',
  '@ You\'re so fat you have more rolls than a bakery.',
  '@ You\'re so fat you don\'t have got cellulite, you\'ve got celluheavy.',
  '@ You\'re so fat you influence the tides.',
  '@ You\'re so fat you jumped off the Grand Canyon and got stuck.',
  '@ You\'re so fat that you laid on the beach and Greenpeace tried to push you back in the water.',
  '@ You\'re so fat you leave footprints in concrete.',
  '@ You\'re so fat you need GPS to find your asshole.',
  '@ You\'re so fat you pull your pants down and your ass is still in them.',
  '@ You\'re so fat you show up on radar.',
  '@ If you were any less intelligent we\'d have to water you three times a week..',
  '@ If your IQ was 3 points higher, you\'d be a rock.',
  '@ I would insult you but nature did a better job.',
  '@ Does your ass get jealous of all the shit that comes out of your mouth?',
  '@ If I ate a bowl of alphabet soup, I could shit out a smarter sentence than any of yours.',
  '@ You\'re not pretty enough to be this stupid.',
  '@ That little voice in the back of your head, telling you you\'ll never be good enough? It\'s right.',
  '@ You look like you\'re going to spend your life having one epiphany after another, always thinking you\'ve ' +
    'finally figured out what\'s holding you back, and how you can finally be productive and creative and turn your ' +
    'life around. But nothing will ever change. That cycle of mediocrity isn\'t due to some obstacle. It\'s who you ' +
    '*are*. The thing standing in the way of your dreams is; that the person having them is *you*.',
  '@ May your day and future be as pleasant as you are.',
  '@ I would agree with you but then we would both be wrong.',
  '@ I bite my thumb at you, sir.',
  '@ I\'d call you a tool, but that would imply you were useful in at least one way.',
  '@ I hope you outlive your children.',
  '@ Are you and your dick having a competition to see who can disappoint me the most?',
  '@ Yo mamma is so ugly her portraits hang themselves.',
  '@ Your birth certificate is an apology from the abortion clinic.',
  '@ If you were anymore inbred you\'d be a sandwich.',
  '@ Say hello to your wife and my kids for me.',
  '@ You are thick-headed bastards with a bloated bureaucracy, designed to compensate for your small and poor ' +
    'self-esteem, cocksuckers. You have the brains to ban the person who has come to support channel your bot, ' +
    'accusing him of violating the ephemeral ephemeral rules, stupid morons. By the way i have one of the biggest ' +
    'server(5.5k  people, ~30 anytime voiceonline members), and i know something about managing, and of these rules ' +
    '- dont be an asshole. You are fucking asshole, maybe it is product of your life alone, or your life with your ' +
    'mom, anyway - you are retard and your soul is a fucking bunch of stupid self-esteems.'
]

exports.kills = [
  '@ had thought that they were strong enough to go into the dungeon of the 72 hellfires, but unfortunately, ' +
    'they were eradicated on the first level.',
  '@ tried to say their last words… unfortunately, their head flew off before any words could be uttered.',
  '@ with a face that shouted “impossible”, were eradicated from the face of the planet with a mere flick of a ' +
    'demon’s hand.',
  '@ believed that they were strong enough to go against gods. Snorting, a god sent a heavenly beam down towards ' +
    'the ground purging anything related to that heretic.',
  '@ tried to resist the final move of the evil eye requiem but couldn’t even give out a scream before they were ' +
    'overwhelmed.',
  '@ cried out in agony as their flesh was ripped little by little and their body was seared with a torch as they ' +
    'wondered why this was happening. Their eyes were slowly dimming…',
  '@ was proud as they ran out from the cave holding its loots, but they didn’t realize the two glowing balls of ' +
    'light that seemed to be mocking them in the darkness of the cave as they left. Soon after, there was nothing ' +
    'left of them except a small fly flying above the golden statue.',
  'Cursing, @ ran towards the opponent when suddenly, the floor gave out and revealed a pit of piranhas waiting to ' +
    'bite the flesh and intestines of their human body…',
  'Using a final trump card move of @, they felt relieved as they saw the dimensional collapse ball of deep abyss ' +
    'stricking the opponent. Right after, a body burst into pulp and a head with a relaxed smile flew towards a ' +
    'man smiling, unharmed in the crater created by the explosion.',
  'Horrified, @ tried to run away only to find that their two legs were gone and in the mouth of the monstrocity. ' +
    'Before they could even scream, their fingers were gone. After that, it was the arms\u2026 then the body\u2026 ' +
    'then finally, the head with the last expression the victim always made\u2026 one of pure agony and utter terror.'
]
