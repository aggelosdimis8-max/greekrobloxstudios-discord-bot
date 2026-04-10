import os
import discord
from discord.ext import commands
from discord import app_commands

TOKEN = os.getenv("DISCORD_TOKEN")

SUPPORT_ROLE_ID = 1483915879019319478
AUTO_ROLE_ID = 1483916619842322543
TICKET_CATEGORY_ID = 1485229897533095988
PANEL_ROLE_ID = 1483915879019319478

intents = discord.Intents.all()
bot = commands.Bot(command_prefix="!", intents=intents)

open_tickets = {}

@bot.event
async def on_ready():
    print(f"Bot online as {bot.user}")
    try:
        synced = await bot.tree.sync()
        print(f"Synced {len(synced)} slash commands")
    except Exception as e:
        print(e)

@bot.event
async def on_member_join(member):
    role = member.guild.get_role(AUTO_ROLE_ID)
    if role:
        await member.add_roles(role)

@bot.tree.command(name="ticketpanel", description="Send the ticket panel")
async def ticketpanel(interaction: discord.Interaction):
    if PANEL_ROLE_ID not in [r.id for r in interaction.user.roles]:
        return await interaction.response.send_message(
            "❌ Δεν έχεις άδεια να χρησιμοποιήσεις αυτή την εντολή.",
            ephemeral=True
        )

    embed = discord.Embed(
        color=discord.Color.orange(),
        title="🎫 XTREME ROLEPLAY | ROBLOX TICKET SYSTEM",
        description="Για την καλύτερη εξυπηρέτησή σας, επιλέξτε το είδος του Ticket που σας ενδιαφέρει..."
    )
    embed.set_footer(text="XTREME ROLEPLAY | ROBLOX")
    embed.set_thumbnail(url="https://i.imgur.com/4M34hi2.png")

    menu = discord.ui.Select(
        placeholder="Open A Ticket",
        custom_id="ticket_menu",
        options=[
            discord.SelectOption(label="👑 Owner", value="Owner"),
            discord.SelectOption(label="🔔 Manager", value="Manager"),
            discord.SelectOption(label="📞 Support", value="Support"),
            discord.SelectOption(label="💸 Donate", value="Donate"),
            discord.SelectOption(label="🔍 Report Staff", value="Report_Staff"),
            discord.SelectOption(label="⛔ Ban Appeal", value="Ban_Appeal"),
            discord.SelectOption(label="💼 Civilian Job", value="Civilian_Job"),
            discord.SelectOption(label="🔫 Criminal Job", value="Criminal_Job"),
            discord.SelectOption(label="🔑 Anticheat", value="Anticheat")
        ]
    )

    view = discord.ui.View()
    view.add_item(menu)

    await interaction.response.send_message("✔ Panel sent.", ephemeral=True)
    await interaction.channel.send(embed=embed, view=view)

class TicketMenu(discord.ui.View):
    @discord.ui.select(custom_id="ticket_menu")
    async def select_callback(self, interaction: discord.Interaction, select: discord.ui.Select):
        user = interaction.user
        type = select.values[0]

        if user.id in open_tickets:
            return await interaction.response.send_message(
                "❗ Έχεις ήδη ανοιχτό ticket!",
                ephemeral=True
            )

        ticket_names = {
            "Owner": "👑 Owner",
            "Manager": "🔔 Manager",
            "Support": "📞 Support",
            "Donate": "💸 Donate",
            "Report_Staff": "🔍 Report Staff",
            "Ban_Appeal": "⛔ Ban Appeal",
            "Civilian_Job": "💼 Civilian Job",
            "Criminal_Job": "🔫 Criminal Job",
            "Anticheat": "🔑 Anticheat"
        }

        channel_name = f"{ticket_names[type]}-{user.name}".replace(" ", "_")

        guild = interaction.guild
        category = guild.get_channel(TICKET_CATEGORY_ID)

        channel = await guild.create_text_channel(
            name=channel_name,
            category=category,
            overwrites={
                guild.default_role: discord.PermissionOverwrite(view_channel=False),
                user: discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True),
                guild.get_role(SUPPORT_ROLE_ID): discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True)
            }
        )

        open_tickets[user.id] = channel.id

        embed = discord.Embed(
            color=discord.Color.orange(),
            title="🎫 Ticket Created",
            description="Παρακαλω περιμενετε το staff team θα σας εξυπηρετησει συντομα!!\n\nΑν θελετε να κλεισετε το ticket πατήστε το 🔒 Delete Ticket"
        )
        embed.set_thumbnail(url="https://i.imgur.com/4M34hi2.png")

        close_button = discord.ui.Button(
            label="🔒 Delete Ticket",
            style=discord.ButtonStyle.danger,
            custom_id="close_ticket"
        )

        view = discord.ui.View()
        view.add_item(close_button)

        await channel.send(embed=embed, view=view)

        await interaction.response.send_message(
            f"📩 Το ticket σου δημιουργήθηκε: {channel.mention}",
            ephemeral=True
        )

class CloseTicket(discord.ui.View):
    @discord.ui.button(label="🔒 Delete Ticket", style=discord.ButtonStyle.danger, custom_id="close_ticket")
    async def close(self, interaction: discord.Interaction, button: discord.ui.Button):
        user_id = None
        for uid, cid in open_tickets.items():
            if cid == interaction.channel.id:
                user_id = uid
                break

        if user_id:
            del open_tickets[user_id]

        await interaction.response.send_message("🔒 Το ticket θα διαγραφεί σε 3 δευτερόλεπτα...", ephemeral=True)
        await interaction.channel.delete(delay=3)

bot.run(TOKEN)

