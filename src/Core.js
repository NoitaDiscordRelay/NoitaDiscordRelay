import net from 'net'
import { Client, Intents } from 'discord.js'
import { DISCORD_TOKEN } from './Environment'

import Game from './Game'
import Connection from './Connection'

export default class Core {
	
	constructor(secondInstance = false) {
		this.games = {}
		this.streamers = {}
		this.rooms = {}
		
		this.server = new net.Server()
		this.server.listen(6667, process.env.LISTEN_ADDR)
		this.server.on('connection', socket => this.onServerConnection(socket))
		
		this.serverLow = new net.Server()
		this.serverLow.listen(1000, process.env.LISTEN_ADDR)
		this.serverLow.on('connection', socket => this.onServerConnection(socket))

		this.discord = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] })
		this.discord.on('ready', () => this.onDiscordReady())
		this.discord.on('message', message => this.onDiscordMessage(message))
		this.discord.login(DISCORD_TOKEN)
		
		process.on('unhandledRejection', error => console.error('Unhandled promise rejection:', error))
	}
	
	onServerConnection(socket) {
		new Connection(socket, this)
	}
	
	async onDiscordReady() {
		console.log("We're up and ready!")
	}
	
	onDiscordMessage(message) {
		try {
			const game = this.games[message.channel.id]
			switch(message.content) {
				case "!noita":	
					const key = `${message.author.username.replace(/[^a-zA-Z0-9]+/g, '')}${message.author.discriminator}`.toLowerCase()
					this.streamers["#"+key] = message.channel.id

					this.games[message.channel.id] = new Game(message.guild.id, message.channel.id, message.author.id)

					this.sendMessage(message.channel, `Streaming room activated. You can connect with your channel name \`${key}\`.`)
					return

				case "!invite":
					this.sendMessage(message.channel, `You can invite NDR to your server here: https://discord.com/oauth2/authorize?client_id=867122283683774464&scope=bot&permissions=0`)
					return

				case "1":
				case "2":
				case "3":
				case "4":
					if(game == undefined)
						return

					if(game.connection == undefined)
						return this.sendMessage(message.channel, 'Game not in progress.')

					message.react('👍')
					game.connection.sendPrivMsg(message.content, message.author.username, message.author.id)
					return

				default:
					if(game == undefined || game.connection == undefined)
						return

					game.connection.sendPrivMsg(message.content, message.author.username, message.author.id)
					return
			}
		} catch(e) {
			console.log("ERROR WHEN HANDLING MESSAGE:")
			console.error(e);
		}
	}
	
	setGameConnection(key, connection) {
		const channel = this.streamers[key.toLowerCase()]
		const game = this.games[channel]
		if(!channel || !game)
			return false
		
		game.connection = connection
		try {
			this.discord.channels.cache.get(game.channelId).send(`A new streamer has connected.`)
		} catch(e) {
			console.error(e)
		}
		return true
	}
	
	async getMembers(key) {
		try {
			const channel = this.streamers[key.toLowerCase()]
			const game = this.games[channel]
			if(!channel || !game)
				return []

			const guild = await this.discord.guilds.cache.get(game.guildId)
			await guild.members.fetch()

			const members = []
			guild.members.cache.forEach(member => members.push(member.user.username.replace(/[^\x00-\x7F]/g, ".").replace(/ /g, '')))
			return members.filter(m => m.replace(/\./g, '').length != 0)
		} catch(e) {
			console.error("error getting guild members:")
			console.error(e)
			return []
		}
	}
	
	async sendMessage(channel, message) {
		try {
			channel.send(message)
		} catch(e) {
			console.error("error sending message:")
			console.error(e)
		}
	}
	
}
