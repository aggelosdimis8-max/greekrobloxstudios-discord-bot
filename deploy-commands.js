const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
    new SlashCommandBuilder()
        .setName("ticketpanel")
        .setDescription("Στέλνει το ticket panel"),

    new SlashCommandBuilder()
        .setName("say")
        .setDescription("Στέλνει ένα embed σε συγκεκριμένο κανάλι")
        .addStringOption(option =>
            option.setName("message")
                .setDescription("Το μήνυμα που θα σταλεί")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Το κανάλι που θα σταλεί το μήνυμα")
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

rest.put(
    Routes.applicationGuildCommands("1462551971478245516", "1483915492526653491"),
    { body: commands }
)
.then(() => console.log("Commands registered"))
.catch(console.error);
