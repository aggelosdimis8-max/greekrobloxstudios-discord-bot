const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ENV TOKEN
const TOKEN = process.env.DISCORD_TOKEN;

// IDs
const SUPPORT_ROLE_ID = "1483915879019319478";
const AUTO_ROLE_ID = "1483916619842322543";
const TICKET_CATEGORY_ID = "1485229897533095988";
const PANEL_ROLE_ID = "1483915879019319478";

const openTickets = new Map();

// ---------------- READY ----------------
client.once("ready", () => {
    console.log(`Bot is online as ${client.user.tag}`);
});

// ---------------- AUTO ROLE ----------------
client.on("guildMemberAdd", async (member) => {
    const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
    if (role) member.roles.add(role);
});

// ---------------- SLASH COMMAND HANDLER ----------------
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
            .setColor("Orange")
            .setTitle("🎫 XTREME ROLEPLAY | ROBLOX TICKET SYSTEM")
            .setDescription("Για την καλύτερη εξυπηρέτησή σας, επιλέξτε το είδος του Ticket που σας ενδιαφέρει...")
            .setFooter({ text: "XTREME ROLEPLAY | ROBLOX" })
            .setThumbnail("https://i.imgur.com/4M34hi2.png");

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("ticket_menu")
                .setPlaceholder("Open A Ticket")
                .addOptions([
                    { label: "👑 Owner", value: "Owner" },
                    { label: "🔔 Manager", value: "Manager" },
                    { label: "📞 Support", value: "Support" },
                    { label: "💸 Donate", value: "Donate" },
                    { label: "🔍 Report Staff", value: "Report_Staff" },
                    { label: "⛔ Ban Appeal", value: "Ban_Appeal" },
                    { label: "💼 Civilian Job", value: "Civilian_Job" },
                    { label: "🔫 Criminal Job", value: "Criminal_Job" },
                    { label: "🔑 Anticheat", value: "Anticheat" }
                ])
        );

        await interaction.reply({ content: "✔ Panel sent.", ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [menu] });
    }
});

// ---------------- TICKET CREATION ----------------
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
        "Owner": "👑 Owner",
        "Manager": "🔔 Manager",
        "Support": "📞 Support",
        "Donate": "💸 Donate",
        "Report_Staff": "🔍 Report Staff",
        "Ban_Appeal": "⛔ Ban Appeal",
        "Civilian_Job": "💼 Civilian Job",
        "Criminal_Job": "🔫 Criminal Job",
        "Anticheat": "🔑 Anticheat"
    };

    const channelName = `${ticketNames[type]}-${user.username}`.replace(/ /g, "_");

    const channel = await interaction.guild.channels.create({
        name: channelName,
        type: 0,
        parent: TICKET_CATEGORY_ID,
        permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: SUPPORT_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
        ]
    });

    openTickets.set(user.id, channel.id);

    const ticketEmbed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🎫 Ticket Created")
        .setDescription("Παρακαλω περιμενετε το staff team θα σας εξυπηρετησει συντομα!!\n\nΑν θελετε να κλεισετε το ticket πατήστε το 🔒 Delete Ticket")
        .setThumbnail("https://i.imgur.com/4M34hi2.png");

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

// ---------------- CLOSE TICKET ----------------
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "close_ticket") {
        const userId = [...openTickets.entries()].find(([_, ch]) => ch === interaction.channel.id)?.[0];
        if (userId) openTickets.delete(userId);

        await interaction.reply({ content: "🔒 Το ticket θα διαγραφεί σε 3 δευτερόλεπτα...", ephemeral: true });
        setTimeout(() => interaction.channel.delete(), 3000);
    }
});

// ---------------- LOGIN ----------------
client.login(TOKEN);
