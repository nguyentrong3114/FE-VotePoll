# Backend Improvements for PollHub

## Current Issues:
1. JoinRoom method không return value mà chỉ send events
2. Vote method không trả về kết quả vote

## Suggested Backend Changes:

### Option 1: Keep Event-Based Approach (Recommended)
```csharp
public async Task<bool> JoinRoom(string roomId, string? password = null)
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
                return false;
            }
            else
            {
                await Clients.Caller.SendAsync("JoinError", new { 
                    message = "Incorrect password for private room.",
                    errorCode = "WRONG_PASSWORD"
                });
                return false;
            }
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        await Clients.Caller.SendAsync("PollUpdated", poll);
        await Clients.Caller.SendAsync("JoinSuccess", new { 
            message = "Successfully joined the poll room.",
            roomId = poll.RoomId,
            poll = poll
        });
        return true;
    }
    catch (Exception ex)
    {
        await Clients.Caller.SendAsync("JoinError", new { 
            message = $"Server error: {ex.Message}",
            errorCode = "SERVER_ERROR"
        });
        return false;
    }
}

public async Task<bool> Vote(string roomId, string option)
{
    try
    {
        var poll = _pollService.Vote(roomId, option);
        if (poll != null)
        {
            await Clients.Group(roomId).SendAsync("PollUpdated", poll);
            return true;
        }
        return false;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Vote error: {ex.Message}");
        return false;
    }
}
```

### Option 2: Return-Based Approach (Alternative)
```csharp
public async Task<object> JoinRoom(string roomId, string? password = null)
{
    var poll = _pollService.JoinPoll(roomId, password);
    if (poll == null)
    {
        var existingPoll = _pollService.GetPoll(roomId);
        if (existingPoll == null)
        {
            return new { 
                success = false,
                message = "Poll room not found.",
                errorCode = "ROOM_NOT_FOUND"
            };
        }
        else
        {
            return new { 
                success = false,
                requiresPassword = true,
                message = "Incorrect password for private room.",
                errorCode = "WRONG_PASSWORD"
            };
        }
    }

    await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
    await Clients.Caller.SendAsync("PollUpdated", poll);
    
    return new { 
        success = true,
        message = "Successfully joined the poll room.",
        roomId = poll.RoomId,
        poll = poll
    };
}
```

## Recommendations:
1. **Keep Event-Based**: Current frontend đã được cập nhật để xử lý events
2. **Add Error Handling**: Wrap methods trong try-catch
3. **Consistent Response**: Luôn return bool hoặc object từ Hub methods
4. **Logging**: Add logging để debug
