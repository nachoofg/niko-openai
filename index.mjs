import { ActivityType, Client, EmbedBuilder } from 'discord.js';
import { Configuration, OpenAIApi } from 'openai';
import { config } from 'dotenv'

config()

const configg = new Configuration({
    apiKey: process.env.api
})
const api = new OpenAIApi(configg)

const client = new Client({
    intents: ['DirectMessages', "Guilds", "GuildMembers", "MessageContent", "GuildMessages"],
    presence: {
        activities: [{
            name: "Mention me or write in DM",
            type: ActivityType.Playing
        }],
        status: "idle"
    }
}).on('messageCreate', async (msg) => {
    if (msg.author.bot) return
    var arr = []
    console.log('1')
    if (msg.inGuild()) { // in guild
        console.log('2')
        if (msg.content.startsWith(`<@${client.user.id}>`)) {
            console.log('3')
            msg.channel.sendTyping()
            const compl = await api.createCompletion({
                model: "text-davinci-003",
                prompt: `${msg.content.replace(/<@\d+>|<@&\d+>/g, '')}`,
                max_tokens: 4090,
                temperature:0
            })
            compl.data.choices.forEach((choice) => {
                arr.push(choice.text)
            })
            process.on('uncaughtException', () => {
                msg.reply({ content: `🙃 An error was ocurred, please excuse me.` })
            })
            return msg.reply({ embeds: [new EmbedBuilder().setDescription(`${arr.join('\n')}`).setColor('Random')] })
        }
    }
}).on('ready', () => {
    console.clear()
    console.log('prendido')
}).on('error', (err) => {
    console.log(err)
})



client.login(process.env.token)