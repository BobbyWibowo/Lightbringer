**NOTICE:** This project is UNMAINTAINED.

<p align="center">
<img align="center" title="Lightbringer" src="https://a.safe.moe/pM9Ov.png">
</p>

<p align="center">
<b>Lightbringer</b> is yet another <a href="https://discordapp.com">Discord</a> self-bot written with <a href="https://discord.js.org/">discord.js</a>.
</p>

<p align="center">
<a href="https://github.com/feross/standard"><img align="center" title="JavaScript Style Guide" src="https://cdn.rawgit.com/feross/standard/master/badge.svg"></a>
</p>

# Lightbringer
Lightbringer makes full use of ES2017's `async/await` functionality for clear, concise code that is simple to write and easy to comprehend.

## Index
- [Heads up!](#heads-up)
- [FAQ](#faq)
- [Commands](COMMANDS.md)
- [To-do](TODO.md)
- [Requirements](#requirements)
- [Why Yarn?](#why-yarn)
- [Installing](#installing)
- [Updating](#updating)
- [Running](#running)
- [Getting your user-token](#getting-your-user-token)
- [Credits](#credits)

### Heads up!
Please remember that self-bots aren't fully supported by Discord and that it should only be used to make YOUR life easier and not others. Also keep in mind that discord has a set of semi-official rules regarding self-bots:

- A self-bot must not, under any circumstance, respond to other user's messages. This means it should not respond to commands, should not autoreply to certain keywords, etc. You must be the only one that can control it.
- A self-bot must not, under any circumstance, do "invite scraping". This is the action of detecting server invites in chat, and automatically joining a server using that invite.
- As self-bots run under your account they are subject to the same Terms of Service. Meaning they should not spam, insult or demean others, post NSFW material, spread viruses or illegal material, etc. They have to follow the same rules that you follow.

IF, and only if you accept the above rules of self-bots, then you may proceed.

> Taken from [TheRacingLion/Discord-SelfBot](https://github.com/TheRacingLion/Discord-SelfBot). There is also [this quote](https://github.com/hammerandchisel/discord-api-docs/issues/69#issuecomment-223898291) for further confirmation.

### FAQ
Proceed to [FAQ.md](FAQ.md).
> Information on how to enable some features such as ***Last.fm auto status updater***, *MyAnimeList command*, *mention logger*, etc. is also available in the FAQ.

### Requirements
- `git` ([Windows](https://git-scm.com/download/win) | [Linux](https://git-scm.com/download/linux) | [macOS](https://git-scm.com/download/mac))
- `node` ([Windows](https://nodejs.org/en/download/current/) | [Linux](https://nodejs.org/en/download/package-manager/) | [macOS](https://nodejs.org/en/download/current/))
- `yarn` ([Windows](https://yarnpkg.com/en/docs/install#windows-tab) | [Linux](https://yarnpkg.com/en/docs/install#linux-tab) | [macOS](https://yarnpkg.com/en/docs/install#mac-tab))

> This bot requires node `>= 7.0` (run `node -v` to check your node version).

### Why Yarn?
A simple reason to use `yarn` instead of `npm` is that yarn is generally much faster (it can be ~8x as fast).  

Using `npm install`:
```
real    1m5.753s
user    0m23.594s
sys     0m6.253s
```

Using `yarn install`:
```
real    0m8.186s
user    0m6.922s
sys     0m4.088s
```

> Taken from [RayzrDev/SharpBot](https://github.com/RayzrDev/SharpBot/wiki/Why-Yarn%3F).

### Installing
```bash
# Download the bot
git clone https://github.com/BobbyWibowo/Lightbringer.git
# Enter the bot folder
cd Lightbringer
# Install dependencies
yarn install
```

Now run `yarn start` to start the bot. 

> The first time you start the bot you will enter the setup wizard.  
> It takes just a few seconds to enter the needed information, and it sets up the bot for you.

### Updating
Minor updates can be acquired by running `lbexec git pull` in Discord to run the `git pull` command on your computer, afterwards you will have to run `lbrestart` to restart the bot.  
Some updates, however, change too much to be updated like that, and instead you must do the following commands in your terminal/command prompt:
```bash
# Go to the Lightbringer folder
cd path/to/Lightbringer
# Pull in any changes
git pull
# Install new dependencies
yarn install
```

### Running
```bash
# Go to the Lightbringer folder
cd path/to/Lightbringer
# Start the bot up
yarn start
```

> If you have PM2 installed, you may use `yarn pm2` to start the bot with PM2.  
> If you simply want to run the bot in background, you can try [screen](https://www.gnu.org/software/screen/), which is usually available by default in most Linux distros, with `yarn background`.

### Getting your user-token
1. Hit `CTRL+SHIFT+I` (`CMD+ALT+I` on macOS) to bring up the Developers Console
> If you already see the `Application` tab, you can skip step 2
2. At the top, click on the arrow pointing to the right
3. Click `Application`
4. Go to `Local Storage` under the `Storage` section
5. Click on `https://discordapp.com`
6. At the bottom of the list, the last key should be `token`
7. Copy the value on the right side (omitting the quotes)

![Getting your user-token](https://a.safe.moe/p6xJ7.png)

## Credits
This bot was originally based on [RayzrDev's SharpBot](https://github.com/RayzrDev/SharpBot) (which was apparently also based on [eslachance's djs-selfbot-v9](https://github.com/eslachance/djs-selfbot-v9)).

Icon made by [Freepik](http://www.freepik.com/) from [www.flaticon.com](http://www.flaticon.com/).
