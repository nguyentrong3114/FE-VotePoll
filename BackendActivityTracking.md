# Backend Activity Tracking Implementation

## Updated PollHub.cs

```csharp
using Microsoft.AspNetCore.SignalR;
using RealTimePoll.Application.Services;
using System.Collections.Concurrent;

namespace RealTimePoll.Api.Hubs;

public class PollHub : Hub
{
    private readonly PollService _pollService;
    // Track users in each room
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, UserInfo>> _roomUsers = new();

    public class UserInfo
    {
        public string UserId { get; set; } = "";
        public string? UserName { get; set; }
        public string ConnectionId { get; set; } = "";
        public DateTime JoinedAt { get; set; }
        public bool HasVoted { get; set; }
        public string? VotedOption { get; set; }
    }

    public PollHub(PollService pollService)
    {
        _pollService = pollService;
    }

    public async Task JoinRoom(string roomId, string? password = null, string? userName = null)
    {
        try 
        {
            var poll = _pollService.JoinPoll(roomId, password);
            if (poll == null)
            {
                // Kiểm tra xem phòng có tồn tại không
                var existingPoll = _pollService.GetPoll(roomId);
                if (existingPoll == null)
                {
                    await Clients.Caller.SendAsync("JoinError", new { 
                        message = "Poll room not found.",
                        errorCode = "ROOM_NOT_FOUND"
                    });
                    return;
                }
                else
                {
                    await Clients.Caller.SendAsync("JoinError", new { 
                        message = "Incorrect password for private room.",
                        errorCode = "WRONG_PASSWORD"
                    });
                    return;
                }
            }

            // Add user to room
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);

            // Track user info
            var userId = Context.ConnectionId; // or use a proper user ID system
            var userInfo = new UserInfo
            {
                UserId = userId,
                UserName = userName,
                ConnectionId = Context.ConnectionId,
                JoinedAt = DateTime.UtcNow,
                HasVoted = false
            };

            _roomUsers.AddOrUpdate(roomId, 
                new ConcurrentDictionary<string, UserInfo> { [userId] = userInfo },
                (key, existingUsers) => {
                    existingUsers[userId] = userInfo;
                    return existingUsers;
                });

            // Send responses
            await Clients.Caller.SendAsync("PollUpdated", poll);
            await Clients.Caller.SendAsync("JoinSuccess", new { 
                message = "Successfully joined the poll room.",
                roomId = poll.RoomId,
                poll = poll
            });

            // Notify room about new user (excluding the new user)
            await Clients.OthersInGroup(roomId).SendAsync("UserJoined", userInfo);

            // Send current user list to the new user
            if (_roomUsers.TryGetValue(roomId, out var users))
            {
                await Clients.Caller.SendAsync("UserListUpdate", users.Values.ToList());
            }
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("JoinError", new { 
                message = $"Server error: {ex.Message}",
                errorCode = "SERVER_ERROR"
            });
        }
    }

    public async Task Vote(string roomId, string option)
    {
        try
        {
            var poll = _pollService.Vote(roomId, option);
            if (poll != null)
            {
                // Update poll for all users in room
                await Clients.Group(roomId).SendAsync("PollUpdated", poll);

                // Track user vote
                var userId = Context.ConnectionId;
                if (_roomUsers.TryGetValue(roomId, out var users) && users.TryGetValue(userId, out var userInfo))
                {
                    userInfo.HasVoted = true;
                    userInfo.VotedOption = option;

                    // Notify room about the vote (excluding the voter)
                    await Clients.OthersInGroup(roomId).SendAsync("UserVoted", new {
                        userId = userInfo.UserId,
                        userName = userInfo.UserName,
                        option = option
                    });

                    // Send updated user list to room
                    await Clients.Group(roomId).SendAsync("UserListUpdate", users.Values.ToList());
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Vote error: {ex.Message}");
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Remove user from all rooms
        var connectionId = Context.ConnectionId;
        foreach (var room in _roomUsers)
        {
            if (room.Value.TryRemove(connectionId, out var userInfo))
            {
                // Notify room about user leaving
                await Clients.Group(room.Key).SendAsync("UserLeft", userInfo.UserId);
                
                // Send updated user list
                await Clients.Group(room.Key).SendAsync("UserListUpdate", room.Value.Values.ToList());
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}
```

## Required Changes:

1. **Track Users**: Store user information in memory (consider using Redis for production)
2. **User Events**: Send UserJoined, UserLeft, UserVoted events
3. **User List**: Maintain and broadcast user list updates
4. **Disconnect Handling**: Clean up when users disconnect
5. **Vote Tracking**: Track who voted for what

## Optional Enhancements:

1. **User Names**: Allow users to set display names
2. **Persistent Storage**: Store activity in database
3. **Room Admin**: Designate room creator as admin
4. **User Roles**: Different permissions for host vs participants
5. **Activity History**: Full activity log with timestamps
