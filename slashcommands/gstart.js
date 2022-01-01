const { SlashCommandBuilder } = require('@discordjs/builders')
const { ChannelType } = require('discord-api-types/v9')
const { CommandInteraction, MessageEmbed } = require('discord.js')
const ms = require('ms')

//
module.exports = {
    data: new SlashCommandBuilder()
        .setName('gstart')
        .setDescription('Start a giveaway!')
        .addStringOption((option) => {
            return option
                .setName('time')
                .setDescription('Specify how long the giveaway should last')
                .setRequired(true)
        })
        .addNumberOption((option) => {
            return option
                .setName('winners')
                .setDescription('Specify the amount of winners')
                .setRequired(true)
        })
        .addStringOption((option) => {
            return option
                .setName('prize')
                .setDescription('Specify the prize for the giveaway')
                .setRequired(true)
        })
        .addChannelOption((option) => {
            return option
                .setName('channel')
                .setDescription(
                    'Mention the channel you want the giveaway to be in.'
                )
                .setRequired(true)
                .addChannelType(ChannelType.GuildText)
        })
        .addStringOption((option) => {
            return option
                .setRequired(false)
                .setName('role_requirement')
                .setDescription(
                    "Add role requirements to the giveaway, add multiple by seperating roles ids with ' '"
                )
        })
        .addUserOption((option) => {
            return option
                .setRequired(false)
                .setName('donator')
                .setDescription(
                    'The person who is donating towards the giveaway'
                )
        }),

    /**
     *
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const data = {
            prize: interaction.options.getString('prize'),
            winners: interaction.options.getNumber('winners'),
            time: interaction.options.getString('time'),
            channel: interaction.options.getChannel('channel'),
            req: interaction.options.getString('role_requirement') || null,
            donor: interaction.options.getUser('donator') || null,
        }

        let time = data.time
        if (isNaN(ms(time))) {
            return interaction.reply({
                content: `Specify a valid time, I couldn't parse \`${time}\``,
                ephemeral: true,
            })
        }
        time = ms(time)

        const winners = data.winners
        const channel = data.channel
        const donor = data.donor
        let rawQuirement = false
        const req = []
        if (data.req) {
            rawQuirement = req.split(' ')
            if (rawQuirement.length) {
                for (const r of rawQuirement) {
                    req.push(r)
                }
            } else req = rawQuirement
        } else req = false

        const embed = new MessageEmbed()
            .setTitle(data.prize)
            .setDescription(
                `React with 🎉 to enter!\n**Time**: ${ms(time, {
                    long: true,
                })}\n**Winners**: ${winners}\n**Host**: ${interaction.user.toString()}`
            )
            .setColor('GREEN')
        if (req.length)
            embed.addField(
                'Requirements',
                `Roles: ${req.map((val) => `<@&${val}>`).join(', ')}`,
                false
            )
        if (donor) embed.addField('Donator:', `${donor.toString()}`, false)

        interaction.reply({ embeds: [embed] })
    },
}