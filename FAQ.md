# Frequently Asked Questions
If your question/problem is not answered here, feel free to send messages to my Discord account: **Bobby#4400**.

## Index
- [Questions](#questions)
- [Common errors](#common-errors)

### Questions
- My game isn't showing after using `lbsetgame`?
> This isn't a bug, it's just how Discord works. It can't be fixed. Don't worry, your game shows for everyone else. If you want to check your game, just use `lbuserinfo`.

- How to enable mention log?
> This feature will automatically log any messages which have you mentioned in them (either through direct mention, role mention, @everyone or @here).  
>
> To enable it, you simply have to make a private channel in your own server to hold all the logs. Once you have made one, get its channel ID by right-clicking on the channel name then click on `Copy ID` menu.  
Afterwards, edit `.../Lightbringer/data/configs/config.json` file, then add the following:
> ```
> "mentionLogChannel": "CHANNEL_ID"
> ```
> Replace `CHANNEL_ID` with the ID that you had copied before.  
Once you're done, you'll have to restart the bot.
>
> Please note that by default it won't monitor any servers. To whitelist a particular server, you have to use `lbtmention` command in the said server (it doesn't matter in which channel you use it on). It's a toggle command, so you will just have to use the command again to blacklist the server.

- How to enable auto Last.fm playing status updater?
> This feature will automatically poll Last.fm server every 5 seconds to check whether your Last.fm account is currently scrobbling anything or not. When it's scrobbling, it will automatically update your Discord game status with the title of the currently scrobbling song.  
>
> To enable this feature, first you will need to get your Last.fm API key.  
To get an API key, submit the form in this page: https://www.last.fm/api/account/create.  
You can leave `Callback URL` field empty. As for `Application homepage` field, feel free to use this repo URL.  
Once you have submitted the form and got your API key, save them somewhere safe since you wouldn't be able to see them again later from Last.fm website.  
Afterwards, edit `.../Lightbringer/data/configs/config.json` file, then add the following:
> ```
> "lastFmApiKey": "YOUR_LASTFM_API_KEY",
> "lastFmUsername": "YOUR_LASTFM_USERNAME"
> ```
> Replace `YOUR_LASTFM_API_KEY` with the API key and `YOUR_LASTFM_USERNAME` with your Last.fm username.  
Once you're done, you will just have to restart the bot and it will automatically update your game status whenever you're scrobbling anything to Last.fm.  
>
> Please note that when it's scrobbling, you won't be able to manually change your game using `lbsetgame`. And if you want to temporarily disable this feature, you can simply use `lblastfm toggle` (since it's a toggle command, use it again to re-enable).

- How to enable MyAnimeList command (`lbmal`)?
> Edit `.../Lightbringer/data/configs/config.json` file, then add the following:
> ```
> "malUser": "YOUR_MYANIMELIST_USERNAME",
> "malPassword": "YOUR_MYANIMELIST_PASSWORD",
> ```
> Afterwards, restart the bot and try the command again.
>
> **NOTE:** This command is currently disabled.

- How to enable Merriam-Webster command (`lbdictionary`)?
> https://github.com/BobbyWibowo/Lightbringer/commit/4b5fdba4022a1235c52624a54c5670d892f07c96#commitcomment-25355888

### Common errors
- `ERROR: There are no scenarios; must have at least one.`
> This occurs if you install Yarn incorrectly on Linux. Please read the [official Yarn installation instructions for Linux](http://yarnpkg.com/en/docs/install#linux-tab).

- `Error: Cannot find module './config.json'`
> This means you did not set up the `config.json` for the bot. Please read the [Lightbringer installation instructions](https://github.com/BobbyWibowo/Lightbringer#installing).

- `Error: Cannot find module './docs'`
> This is a bug with `mathjs` module, though it's still unclear whether it's caused by `yarn` or the module itself. To solve this, you'll have to download the files in `https://github.com/josdejong/mathjs/tree/4e1142a1/lib/expression/docs`. You can use [this tool](https://minhaskamal.github.io/DownGit/#/home?url=https://github.com/josdejong/mathjs/tree/4e1142a1/lib/expression/docs) to download them. Once you have downloaded the archived file, extract its content to `.../Lightbringer/node_modules/mathjs/lib/expression/docs`.
>
> **NOTE:** This issue seemed to be caused by `yarn clean`. By default it would get rid of `docs` in modules. Usually it would work just fine, but `mathjs` module required some files in its `docs` directory. If you had not run `yarn clean`, you would not encounter this issue. But if you had run it, try to delete `.yarnclean` file in the bot's root directory.

- `TRACKER : error TRK0005: Failed to locate: "CL.exe". The system cannot find the file specified. [...\Lightbringer\node_modules\leveldown\deps\snappy\snappy.vcxproj]`
> This issue happens on Windows when you haven't configured the required tools for `node-gyp` module. Please refer to [this page](https://github.com/nodejs/node-gyp#on-windows) for more information about what you have to prepare beforehand.

- `SyntaxError: Unexpected token (`
> If this error occurred on any line which contains `async` in it, then it must be because you're running a node installation which doesn't have `async/await` feature enabled by default.  
This feature is enabled by default in node `>= 7.6`.  
~~For node with versions `>= 7.0 & < 7.6`, the bot will attempt to automatically enable the flag.~~  
As for node older than that, such as `6.x`, you have no other options but to upgrade your node to either `7.x` or `8.x`.
