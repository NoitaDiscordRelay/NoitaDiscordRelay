# NoitaDiscordRelay
Thinking all the Noita Twitch integration is pretty cool? Sad that it doesn't work with Discord? Not anymore! NDR emulates a compatible Twitch chat backend server, relaying streaming integration to Discord. Now your "friends" can destroy your run for you!

The instructions here are mainly for Windows. NDR will work on Linux and Mac, however you're on your own with getting it up and running - use the instructions here as a guide.

## Installation
You'll need node.js installed. NDR was built for node.js version 16, but may work on newer versions. You can download v16 from: https://nodejs.org/download/release/latest-v16.x/ (windows users will typically want the `node-v16.18.0-x64.msi` file), once installed you can follow the instructions below.

1. Download/clone the source code and extract into a folder.
2. Open a command prompt in the folder to run commands.
3. Run `npm install`
4. Run `npm run build`
5. At this point, the relay is "installed"

### Using docker

You can also run the noita discord relay using docker, either by building the container using the Dockerfile provided or by using the prebuilt container available at https://hub.docker.com/r/hashnv/noita-discord-relay.

```bash
# Replace XXXX with your bot's discord token.
docker pull hashnv/noita-discord-relay:latest
/usr/bin/docker run -e 'DISCORD_TOKEN=XXXX' -p '0.0.0.0:6667:6667' --rm hashnv/noita-discord-relay:latest
```

See 'example-systemd.service' for an example of how to run using systemd. 
This systemd-service requires an EnvironmentFile in /etc/sysconfig/noita-system-relay to configure the `DISCORD_TOKEN` var,
which should be set to something like this:

```bash
OPTIONS='-e "DISCORD_TOKEN=XXXXXXXXX"'
```

Reload your systemctl config by running `sudo systemctl daemon-reload`.
Then, enable the service using `sudo systemctl enable --now noita-discord-relay.service`.
This will set the service to start right now, as well as on system boot.

Check the service status by running `systemctl status noita-discord-relay`.

You may also need to open the port 6667 on your firewall. These days, most linux distributions run firewalld. In firewalld you can open the port with the following command:

```bash
sudo firewall-cmd --add-port 6667/tcp --perm
sudo firewall-cmd --reload
```

You may need to restart the service, to do so run: `sudo systemctl restart noita-discord-relay.service`.

## Configuration
You'll need to have a Discord bot already setup (https://discord.com/developers/applications) and obtain your bots access token. You will need to enable all three "Privileged Gateway Intents" so the bot can function.

Create a file in the NDR folder called `start.bat`, and inside this file put the following - replacing the `XXXXXXX` with your bot token:
```
@echo off
set DISCORD_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
set PID_FILE=%USERPROFILE%\noita-relay-pidfile
npm start
```

## Running
Once you've got everything installed, built, and configured. You should simply be able to double click your `start.bat` file and it will launch to bot. The final step is to configure your hosts file as described on the https://ndr.thcgaming.co.uk/ page. However, instead of using `157.245.29.152`, you will need to use `127.0.0.1`

## Invite your bot
Now your bot is running, you simply have to invite it to your server. To do this you can use the https://discordapi.com/permissions.html calculator - you'll need to provide it your bot's Client ID and it will provide a link you can visit to invite your bot.

### What permissions?
Honestly, I don't recall exactly what permissions NDR requires - it will at the very very very least require "Send Messages" and "Add Reactions", although may require more. If you trust the code enough, you can simply give it the "Administrator" permission and move on with your life :D

## Licence
The MIT License (MIT)

Copyright (c) 2019-2022 Peter Corcoran (R4wizard)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
