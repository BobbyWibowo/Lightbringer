# Commands (74)  
  
## Fun – 28 commands  
### `8ball`  
*Description:* `Uses 8ball.delegator.com to ask the magic 8-ball for a question`  
*Usage:* `8ball <question>`  
*Aliases:* `8b`  
### `anim`  
*Description:* `"Animates" a series of emojis`  
*Usage:* `anim [-d <delay>] <emoji> [emoji2] [...]`  
### `animals`  
*Description:* `Shows you random pictures of cats or dogs`  
*Usage:* `animals [-u] <cats|dogs>`  
*Aliases:* `a`, `animal`  
### `binary`  
*Description:* `Encodes/decodes your input to/from binary`  
*Usage:* `binary <encode|decode> <input>`  
### `booru`  
*Description:* `Search for booru images from various booru sites (looks for a random image from "gelbooru.com" by default)`  
*Usage:* `booru [options] [tag1] [tag2]`  
*Aliases:* `b`  
### `fanceh`  
*Description:* `Renders text in big emoji letters`  
*Usage:* `fanceh <text|emoji|both>`  
*Aliases:* `fancy`, `letters`  
### `feed`  
*Description:* `Force a food item down some users' throat`  
*Usage:* `feed <user-1> [user-2] ... [user-n]`  
### `figlet`  
*Description:* `Renders fancy ASCII text`  
*Usage:* `figlet <text>`  
### `flip`  
*Description:* `Flip text`  
*Usage:* `flip <text>`  
*Credits:* `1Computer1`  
### `fortune`  
*Description:* `Shows a random fortune cookie`  
*Usage:* `fortune [category|list]`  
*Aliases:* `fortunecookie`  
### `get`  
*Description:* `Gets random thing from various APIs`  
*Usage:* `get [type]`  
*Aliases:* `g`, `f`, `fetch`  
### `gif`  
*Description:* `Searches Giphy for GIFs`  
*Usage:* `gif [-u] <query>`  
*Aliases:* `giphy`  
### `gtime`  
*Description:* `Prints current time in yours or a particular location (using Google Maps API)`  
*Usage:* `gtime [location]`  
### `insult`  
*Description:* `Insults some users`  
*Usage:* `insult <user-1> [user-2] ... [user-n]`  
*Credits:* `Twentysix#5252`  
### `jumbo`  
*Description:* `Sends the emojis as image attachments`  
*Usage:* `jumbo [-k] <emojis>`  
*Aliases:* `j`, `large`  
### `kill`  
*Description:* `Kills some users`  
*Usage:* `kill <user-1> [user-2] ... [user-n]`  
*Credits:* `illusorum#8235 (286011141619187712)`  
### `nekos`  
*Description:* `Uses nekos.life to get random nekos image`  
*Usage:* `nekos [lewd]`  
*Aliases:* `neko`  
### `reaction`  
*Description:* `Sends reaction to the previous message`  
*Usage:* `reaction [options] <text|emoji|both>`  
*Aliases:* `react`  
### `reverse`  
*Description:* `Reverses the text you input`  
*Usage:* `reverse <text>`  
### `roll`  
*Description:* `Rolls X dice with Y sides (supports standard dice notation)`  
*Usage:* `roll XdY [reason]`  
*Aliases:* `dice`, `diceroll`, `rolldice`  
### `shoot`  
*Description:* `Shoots the user you mention`  
*Usage:* `shoot <user>`  
### `sigh`  
*Description:* `Dramatic sigh text`  
*Usage:* `sigh`  
### `space`  
*Description:* `Spaces out text to look all dramatic n' stuff`  
*Usage:* `space [amount] <text>`  
### `spongememe`  
*Description:* `Turns a specific message into a SpongeBob meme (this command is cancerous!)`  
*Usage:* `spongememe [-t] [id] [channel]`  
*Aliases:* `sm`  
### `time`  
*Description:* `Prints current time in yours or a particular location (using Time.is)`  
*Usage:* `time [location]`  
*Credits:* `1Computer1`  
### `tiny`  
*Description:* `Converts your text to tiny letters!`  
*Usage:* `tiny <text>`  
### `today`  
*Description:* `Gives a random thing that happened today in history from http://history.muffinlabs.com/date`  
*Usage:* `today <events|births|deaths>`  
### `weave`  
*Description:* `Weave an input text with a certain emoji`  
*Usage:* `weave <emoji> <text>`  
  
## Info – 9 commands  
### `emojis`  
*Description:* `Gets the emojis of the current guild`  
*Usage:* `emojis [options]`  
### `guildinfo`  
*Description:* `Shows info of the server you are in`  
*Usage:* `guildinfo [options] [roles|members|channels]`  
*Aliases:* `guild`, `server`, `serverinfo`  
### `help`  
*Description:* `Shows you help for all commands or just a single command`  
*Usage:* `help all|[command]|[category <name>]`  
*Aliases:* `h`  
### `inrole`  
*Description:* `Shows a list of members which have the specified role`  
*Usage:* `inrole [-r] <role name>`  
### `locate`  
*Description:* `Gets the name of the guild that the emoji comes from`  
*Usage:* `locate <emoji>`  
*Aliases:* `emoji`  
### `roleinfo`  
*Description:* `Shows info of the specified role`  
*Usage:* `roleinfo [options] <role name>`  
*Aliases:* `role`  
### `stats`  
*Description:* `Shows you stats about Lightbringer`  
*Usage:* `stats`  
### `uptime`  
*Description:* `Shows the bot's uptime`  
*Usage:* `uptime`  
*Aliases:* `up`  
### `userinfo`  
*Description:* `Shows yours or another user's info`  
*Usage:* `userinfo <user>`  
*Aliases:* `info`  
  
## Moderation – 10 commands  
### `ban`  
*Description:* `Bans a user`  
*Usage:* `ban <user>`  
### `clone`  
*Description:* `Clones the message with the given ID (may optionally set a channel)`  
*Usage:* `clone [id] [channel]`  
*Aliases:* `copy`  
### `edits`  
*Description:* `Gets all the recent edits of a particular message (dependent on the bot's cache)`  
*Usage:* `edits [id] [channel]`  
### `flush`  
*Description:* `Deletes messages sent by bots`  
*Usage:* `flush <amount>`  
### `getids`  
*Description:* `Gets a list of message IDs`  
*Usage:* `getids [amount] [channel]`  
### `kick`  
*Description:* `Kicks a user`  
*Usage:* `kick <user>`  
### `prune`  
*Description:* `Deletes a certain number of messages sent by you`  
*Usage:* `prune [amount]`  
### `purge`  
*Description:* `Deletes a certain number of messages`  
*Usage:* `purge [amount]`  
### `quote`  
*Description:* `Quotes the message with the given ID (may optionally set a channel)`  
*Usage:* `quote [options] [id] [channel]`  
*Aliases:* `q`  
### `search`  
*Description:* `Searches message in the currently viewed guild for some text`  
*Usage:* `search [options] <text>`  
*Aliases:* `s`  
  
## Utility – 27 commands  
### `avatar`  
*Description:* `Gets yours or another user's avatar`  
*Usage:* `avatar [options] [user]`  
*Aliases:* `ava`  
### `currency`  
*Description:* `Convert currency using exchange rates from http://fixer.io/`  
*Usage:* `currency [<value> <from> <to>|refresh]`  
*Aliases:* `curr`  
### `embed`  
*Description:* `Sends a message via embeds`  
*Usage:* `embed [options] <text>`  
### `eval`  
*Description:* `Evaluates arbitrary JavaScript`  
*Usage:* `eval [options] <command>`  
### `exec`  
*Description:* `Executes a command in the console`  
*Usage:* `exec [-l <lang>] <command>`  
### `generate`  
*Description:* `N/A`  
*Usage:* `generate <commands>`  
*Aliases:* `gen`  
### `gists`  
*Description:* `Uploads some text to GitHub Gists`  
*Usage:* `gists [options] <text>`  
*Aliases:* `gist`  
### `github`  
*Description:* `Links to a GitHub repository`  
*Usage:* `github <user/repo>`  
*Aliases:* `git`  
### `haste`  
*Description:* `Uploads some text to Hastebin`  
*Usage:* `haste [options] <text>`  
*Aliases:* `hastebin`  
### `lastfm`  
*Description:* `Get currently playing song from Last.fm`  
*Usage:* `lastfm [toggle]`  
### `lmgtfy`  
*Description:* `Links to LMGTFY with the given search text`  
*Usage:* `lmgtfy [search text]`  
### `markasread`  
*Description:* `Mark this guild, a certain guild or all guilds as read`  
*Usage:* `markasread [guild|all]`  
*Aliases:* `mar`  
### `math`  
*Description:* `Evaluate math expressions using mathjs library (separate individual expression by new line)`  
*Usage:* `math [options] <expressions>`  
*Aliases:* `calc`, `calculate`  
### `paste`  
*Description:* `Uploads some text to Pastebin`  
*Usage:* `paste [options] <text>`  
*Aliases:* `pastebin`  
### `ping`  
*Description:* `Pings the bot`  
*Usage:* `ping`  
### `prefix`  
*Description:* `Sets the bot prefix`  
*Usage:* `prefix <new prefix>`  
### `reload`  
*Description:* `Reloads all modules (or optionally reload "utils" or "consts")`  
*Usage:* `reload [utils|consts]`  
*Aliases:* `r`  
### `restart`  
*Description:* `Restarts the bot`  
*Usage:* `restart`  
*Aliases:* `res`  
### `setgame`  
*Description:* `Sets your game (shows for other people)`  
*Usage:* `setgame <game>`  
*Aliases:* `setactivity`  
### `shortcuts`  
*Description:* `Controls or lists your shortcuts`  
*Usage:* `shortcuts [<create> <id> <commands>|<delete|info> <id>]`  
*Aliases:* `sc`, `shortcut`  
### `shutdown`  
*Description:* `Shuts down the bot (you'll have to manually start the bot later if you want to)`  
*Usage:* `shutdown`  
*Aliases:* `terminate`  
### `tags`  
*Description:* `Controls or lists your tags`  
*Usage:* `tags [-e] <name>|[-v] list|add <name> [contents]|delete <name>`  
*Aliases:* `t`, `tag`  
### `thesaurus`  
*Description:* `Looks up a word on Thesaurus.com (showing synonyms by default)`  
*Usage:* `thesaurus [options] <query>`  
*Aliases:* `syn`, `synonyms`  
### `tmention`  
*Description:* `Toggle mentions logger in this guild`  
*Usage:* `tmention [list]`  
*Aliases:* `togglemention`  
### `urban`  
*Description:* `Looks up a word on Urban Dictionary (leave query blank to get a random definition)`  
*Usage:* `urban [options] [query]`  
*Aliases:* `u`, `urbandictionary`  
### `weather`  
*Description:* `Shows you weather information of a particular city`  
*Usage:* `weather <city>`  
### `wiki`  
*Description:* `Returns the summary of the first matching search result from Wikipedia`  
*Usage:* `wiki <query>`  
*Aliases:* `w`, `wikipedia`  
  