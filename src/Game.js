export default class Game {
	
	constructor(guildId, channelId, ownerId) {
		this.guildId = guildId
		this.channelId = channelId
		this.ownerId = ownerId
		this.connection = undefined
	}
	
}