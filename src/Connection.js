import crypto from "crypto"

export default class Connection {
	
	constructor(socket, core) {
		this.socket = socket
		this.buffer = ""
		this.nick = ""
		this.user = ""
		this.pass = ""
		this.channel = ""
		this.core = core
		
		this.socket.on('data', d => this.onData(d))
		this.socket.on('error', e => {
			console.log("fuckin' sockets")
			console.error(e)
		})
	}
	
	onData(data) {
		this.buffer += data
		if(this.buffer.indexOf('\n') != -1) {
			let received = this.buffer.split('\r\n')
			while(received.length > 1) {
				this.handlePacket(received[0].split(' '))
				this.buffer = received.slice(1).join('\n')
				received = this.buffer.split('\n')
			}
		}
	}
	
	onDisconnect() {
		
	}
	
	async handlePacket(message) {
		if(process.env.DEBUG) console.log(`[RX] ${message.join(' ')}`)
		switch(message[0]) {
			case "PASS": this.pass = message[1]; break
			case "NICK": this.nick = message[1]; break
			case "USER":
				this.user = message[1]
				this.sendServer(["001", this.user, ":Welcome to the Noita Discord IRC Relay"])
				this.sendServer(["002", this.user, ":Your host is a local relay to discord"])
				this.sendServer(["003", this.user, ":This server is rather new"])
				this.sendServer(["004", this.user, ":-"])
				this.sendServer(["375", this.user, ":-"])
				this.sendServer(["372", this.user, ":You are in a very simple maze leading directly to discord."])
				this.sendServer(["376", this.user, ":>"])
				break
			case "JOIN":
				this.channel = message[1]
				if(!this.core.setGameConnection(this.channel, this)) {
					// We couldn't set the connect to the channel probably because the
					// channel doesn't exist yet, we could close the connection here,
					// but the Noita client will not display any message. Leaving the
					// connection open lets the client display a useful error.
					return
				}
				
				this.sendUser(["JOIN", this.channel])
				this.send([`@emote-only=0;followers-only=-1;r9k=0;rituals=0;room-id=${this.roomId};slow=0;subs-only=0`, ":ndr.thcgaming.co.uk", "ROOMSTATE", this.channel])
				const members = await this.core.getMembers(this.channel)
				this.sendServer(["353", this.user, "=", this.channel, ":" + members.join(' ')])
				this.sendServer(["353", this.user, "=", this.channel, `:${this.user}`])
				this.sendServer(["366", this.user, this.channel, ":End of /NAMES list"])
				break
			case "CAP":
				if(message[1] != "REQ") break
				this.sendServer(["CAP", "*", "ACK", message[2].substr(1)])
				break
		}
	}
	
	send(message) {
		if(process.env.DEBUG) console.log(`[TX] ${message.join(' ')}`)
		this.socket.write(message.join(' ') + "\r\n")
	}
	
	sendUser(message) {
		this.send([`:${this.nick}!${this.user}@${this.user}.ndr.thcgaming.co.uk`, ...message])
	}
	
	sendServer(message) {
		this.send([`:ndr.thcgaming.co.uk`, ...message])
	}
	
	sendPrivMsg(message, userName, userId) {
		const nonce = crypto.randomBytes(16).toString("hex")
		const id = [4, 2, 2, 2, 6].map(group => crypto.randomBytes(group).toString('hex')).join('-')
		
		this.send([
			`@badge-info=;badges=;client-nonce=${nonce};color=;display-name=${userName};emotes=;flags=;id=${id};mod=0;room-id=${this.roomId};subscriber=0;tmi-sent-ts=${Date.now()};turbo=0;user-id=${userId};user-type=`,
			`:${userName}!${userName}@${userName}.ndr.thcgaming.co.uk`,
			"PRIVMSG",
			this.channel,
			`:${message}`
		])
	}
	
}