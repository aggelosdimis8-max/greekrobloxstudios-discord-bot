const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.login(process.env.TOKEN);
const SUPPORT_ROLE_ID = "1483915879019319478";
const AUTO_ROLE_ID = "1483916619842322543";
const TICKET_CATEGORY_ID = "1485229897533095988";
const PANEL_ROLE_ID = "1483915811751067700";
const SAY_ROLE_ID = "1483915811751067700";

const openTickets = new Map();

client.once("ready", () => {
    console.log(`Bot is online as ${client.user.tag}`);
});

client.on("guildMemberAdd", async (member) => {
    const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
    if (role) member.roles.add(role);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "ticketpanel") {
        if (!interaction.member.roles.cache.has(PANEL_ROLE_ID)) {
            return interaction.reply({
                content: "❌ Δεν έχεις άδεια να χρησιμοποιήσεις αυτή την εντολή.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("# 🎫 | Member Support")
            .setDescription("**Do you need help?\n\nYou can open a Ticket from the following:\n\n:blue_circle: 〃Support\n\n:blue_circle: 〃Purchase\n\n:blue_circle: 〃Get Your Reward**\n\n||@everyone @here ||")
            .setFooter({ text: "GREEK ROBLOX STUDIOS" })
            .setThumbnail("https://cdn.discordapp.com/attachments/1483915495412465838/1485230648628347002/static-removebg-preview.png?ex=69c11c54&is=69bfcad4&hm=80fd26bfff33833b0b20aa3d0999251e1188fc569de5e0b4135bf8d942eb8084&");

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("ticket_menu")
                .setPlaceholder("Open A Ticket")
                .addOptions([
                    { label: "📞 Support", value: "Support" },
                    { label: "🛒 Order", value: "Order" },
                    { label: "⁉️ Other", value: "Other" }
                ])
        );

        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply({ content: "✔ Panel sent." });
        await interaction.channel.send({ embeds: [embed], components: [menu] });
    }

    if (interaction.commandName === "say") {
        if (!interaction.member.roles.cache.has(SAY_ROLE_ID)) {
            return interaction.reply({
                content: "❌ Δεν έχεις άδεια να χρησιμοποιήσεις αυτή την εντολή.",
                ephemeral: true
            });
        }

        const message = interaction.options.getString("message");
        const channel = interaction.options.getChannel("channel");

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("📢 Ανακοίνωση")
            .setDescription(`${message}\n\n@everyone @here`)
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        await interaction.reply({
            content: `✔ Το μήνυμα στάλθηκε στο ${channel}`,
            ephemeral: true
        });
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "ticket_menu") return;

    const user = interaction.user;
    const type = interaction.values[0];

    if (openTickets.has(user.id)) {
        return interaction.reply({
            content: "❗ Έχεις ήδη ανοιχτό ticket!",
            ephemeral: true
        });
    }

    const ticketNames = {
        "Support": "📞 Support",
        "Order": "🛒 Order",
        "Other": "⁉️ Other"
    };

    const channelName = `${ticketNames[type]}-${user.username}`.replace(/ /g, "_");

    const channel = await interaction.guild.channels.create({
        name: channelName,
        type: 0,
        parent: TICKET_CATEGORY_ID,
        permissionOverwrites: [
            { id: interaction.guild.id, deny: ["ViewChannel"] },
            { id: user.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] },
            { id: SUPPORT_ROLE_ID, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] }
        ]
    });

    openTickets.set(user.id, channel.id);

    const ticketEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("🎫 Ticket Created")
        .setDescription("Παρακαλώ περιμένετε, το staff team θα σας εξυπηρετήσει σύντομα.\n\nΠατήστε 🔒 για να κλείσετε το ticket.")
        .setThumbnail("https://cdn.discordapp.com/attachments/1483915495412465838/1485230648628347002/static-removebg-preview.png?ex=69c11c54&is=69bfcad4&hm=80fd26bfff33833b0b20aa3d0999251e1188fc569de5e0b4135bf8d942eb8084&");

    const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("🔒 Delete Ticket")
            .setStyle(ButtonStyle.Danger)
    );

    await channel.send({ embeds: [ticketEmbed], components: [closeButton] });

    await interaction.reply({
        content: `📩 Το ticket σου δημιουργήθηκε: ${channel}`,
        ephemeral: true
    });
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "close_ticket") {
        const userId = [...openTickets.entries()].find(([_, ch]) => ch === interaction.channel.id)?.[0];
        if (userId) openTickets.delete(userId);

        await interaction.reply({ content: "🔒 Το ticket θα διαγραφεί σε 3 δευτερόλεπτα...", ephemeral: true });
        setTimeout(() => interaction.channel.delete(), 3000);
    }
});

client.login(process.env.TOKEN);
