# TODO

- [ ] Log users' usernames into the storage then integrate them to `userinfo` command (some kind of "aliases" field)
- [ ] Improve security of `eval` command (token/path masking and recursion detector)  
Maybe binding a modified 'send' command into the channel? Though I'm not sure if it's possible (should be..?)
- [x] `kick` and `ban` commands
- [ ] `punish` command (configurable punishment role for each guild?)
- [x] Command to mark all guilds as read
- [x] Math command & unit conversion command (in a single command using mathjs library)
- [x] Currency conversion command
- [ ] Improve `apidocs` command (search feature, etc.)  
Allow doing something like `lbdocs message.mentions.has` (recursive searching or something like that)
- [x] Add an option to `userinfo` command to show list of mutual guilds
- [x] Weather command
- [x] Weave command (inserts certain emoji in between words of the input text)
- [ ] Toggle debug mode (will suppress stack information on errors when the mode is turned off)  
For the time being, all kind of errors (even those that weren't from code failure) will log stack information into the
console.
- [ ] Add a framework to fetch and cache media (pictures) from Twitter accounts  
I plan to use this with a `catgirl`
command or the likes. So basically I'll just have to provide list of Twitter account(s) which the bot will fetch
pictures and cache their links from. Afterwards the `catgirl` command will simply randomly pick images from the cache.
Maybe I'll also set a "usage" property into the cache so that the command will be able to attempt to post images that
haven't been posted before. Then I'll also probably set maximum pictures to be cached. Ah by the way, it will only cache
the links. To be on the safe side, I'll also make sure that the link is online before trying to use it.
- [ ] ...

> This list has no particular order of priority.
