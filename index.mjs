import { Client, EmbedBuilder } from 'discord.js';
import { Configuration, OpenAIApi } from 'openai';
import { config } from 'dotenv'

config()

const configg = new Configuration({
    apiKey: process.env.api
}),
    mapp = new Map().set('i', 0),
    api = new OpenAIApi(configg),
    error_responses = ["I think i'm missing a bit.", "An error was ocurred, please excuse me.", "I'm so far along that I'm failing."],
    think_responses = ["I need to think a little, this is driving me crazy.", "Let me think.", "I'm at 90ºC, let me think a bit."],
    client = new Client({
        intents: ["Guilds", "GuildMembers", "MessageContent", "GuildMessages", "DirectMessages"],
        presence: {
            status: "idle"
        }
    }).on('messageCreate', async (msg) => {
        if (msg.author.bot) return
        var arr = []
        if (msg.content.startsWith(`<@${client.user.id}>`)) {
            if (msg.content.replace(/<@\d+>|<@&\d+>/g, '').length < 1) return msg.reply({ embeds: [new EmbedBuilder().setDescription(`⚠️ Please introduce a question or problem.`).setColor('Red')] })
            if (msg.guild.members.me.permissions.has('ReadMessageHistory')) {
                if (msg.guild.members.me.permissions.has('SendMessages')) {
                    if (msg.guild.members.me.permissions.has('EmbedLinks')) {
                        msg.channel.sendTyping()
                        var message = await msg.reply({ embeds: [new EmbedBuilder().setDescription(`🤔 ${think_responses[Math.floor(Math.random() * think_responses.length)]}`).setColor('Yellow')] })
                        try {
                            const compl = await api.createCompletion({
                                model: "text-davinci-003",
                                prompt: `${msg.content.replace(/<@\d+>|<@&\d+>/g, '')}`,
                                max_tokens: 4000,
                                temperature: 0.2,
                            })
                            compl.data.choices.forEach((choice) => {
                                arr.push(`${choice.text}\n`)
                            })
                            process.on('uncaughtException', () => {
                                return message.edit({ embeds: [new EmbedBuilder().setDescription(`🙃 ${error_responses[Math.floor(Math.random() * error_responses.length)]}`).setColor('Red')] })
                            })
                            mapp.set('i', (mapp.get('i') + 1))
                            return message.edit({ embeds: [new EmbedBuilder().setDescription(`${arr.join('\n')}`).setColor('Green').setFooter({ text: `Request N°${(mapp.get('i') - 1)}` })] })
                        } catch (error) {
                            if (error.response) {
                                return message.edit({ embeds: [new EmbedBuilder().setDescription(`🙃 ${error_responses[Math.floor(Math.random() * error_responses.length)]} ||${error.response.status}||`).setColor('Red')] })
                            } else {
                                return message.edit({ embeds: [new EmbedBuilder().setDescription(`🙃 ${error_responses[Math.floor(Math.random() * error_responses.length)]} ||Unknown||`).setColor('Red')] })
                            }
                        }
                    } else return msg.reply({ content: "⚠️ Give me `EmbedLinks` permission to work." })
                } else return msg.author.send({ content: "⚠️ Give me `SendMessages` permission to work." }).catch(() => { return })
            } else return msg.author.send({ content: "👀 Give me `ReadMessageHistory` permission to work." }).catch(() => { return })
        }
    }).on('ready', () => {
        console.clear()
        console.log('prendido')
    }).on('error', (err) => {
        console.log(err)
    })



client.login(process.env.token)