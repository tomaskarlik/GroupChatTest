using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace GroupChatTest.Hubs
{
    public class ChatHub : Hub 
    {

        public async Task SendMessage(string user, string groupId, string message)
        {
            string[] groups = { "groupA", "groupB", "groupC", "groupD" };
            foreach (string grp in groups)
            {   // poslat ostatnim skupinam
                if (grp==groupId)
                {
                    continue;
                }
                await Clients.Group(grp).SendAsync("ReceiveMessage", groupId, message, "true");
            }

            // poslat me skupine
            await Clients.GroupExcept(groupId, Context.ConnectionId).SendAsync("ReceiveMessage", groupId + " (" + user + ")", message, "true");

            // poslat sobe
            await Clients.Caller.SendAsync("ReceiveMessageFromMe", message);
        }

        public override Task OnConnectedAsync()
        {
            string group = Context.GetHttpContext().Request.Query["groupId"].ToString();
            Groups.AddToGroupAsync(Context.ConnectionId, group);

            Clients.GroupExcept(group, this.Context.ConnectionId).SendAsync("ReceiveMessage", "Chat bot", "Do Vaší skupiny se přihlásil další člen.", "false");
            return Clients.Caller.SendAsync("ReceiveMessage", "Chat bot", "Vítejte ve skupině " + group + "...", "false");
        }

    }
}
