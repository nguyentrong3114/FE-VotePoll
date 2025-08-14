# Backend API for Public Rooms

## Required Controller: PublicRoomsController.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using RealTimePoll.Application.Services;

namespace RealTimePoll.Api.Controllers;

[ApiController]
[Route("api/polls")]
public class PublicRoomsController : ControllerBase
{
    private readonly PollService _pollService;

    public PublicRoomsController(PollService pollService)
    {
        _pollService = pollService;
    }

    [HttpGet("public")]
    public async Task<IActionResult> GetPublicRooms()
    {
        try
        {
            var publicRooms = await _pollService.GetPublicRoomsAsync();
            
            var response = new
            {
                rooms = publicRooms.Select(room => new
                {
                    roomId = room.RoomId,
                    question = room.Question,
                    totalVotes = room.Options?.Values.Sum() ?? 0,
                    createdAt = room.CreatedAt.ToString("O"), // ISO 8601 format
                    isActive = room.IsActive,
                    hasPassword = !string.IsNullOrEmpty(room.Password)
                }).ToList(),
                total = publicRooms.Count()
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }
}
```

## Required Service Methods

Add to `PollService.cs`:

```csharp
public class PollService
{
    // Existing code...

    public async Task<IEnumerable<Poll>> GetPublicRoomsAsync()
    {
        try
        {
            // Get all active polls that are public (no password or allow public listing)
            var publicRooms = _polls.Values
                .Where(poll => poll.IsActive && 
                              poll.CreatedAt > DateTime.UtcNow.AddHours(-24)) // Only show rooms from last 24 hours
                .OrderByDescending(poll => poll.CreatedAt)
                .Take(10) // Limit to 10 most recent rooms
                .ToList();

            return publicRooms;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting public rooms: {ex.Message}");
            return new List<Poll>();
        }
    }

    public Poll? GetPoll(string roomId)
    {
        _polls.TryGetValue(roomId, out var poll);
        return poll;
    }
}
```

## Required Model Updates

Add to `Poll` model:

```csharp
public class Poll
{
    public string RoomId { get; set; } = "";
    public string Question { get; set; } = "";
    public Dictionary<string, int> Options { get; set; } = new();
    public string? Password { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    
    // New properties for better management
    public string? CreatorConnectionId { get; set; }
    public bool AllowPublicListing { get; set; } = true; // Allow room to appear in public list
    public int MaxParticipants { get; set; } = 1000;
    public DateTime? ExpiresAt { get; set; }
}
```

## API Response Format

```json
{
  "rooms": [
    {
      "roomId": "ABC123",
      "question": "Bạn thích màu gì nhất?",
      "totalVotes": 15,
      "createdAt": "2025-08-14T10:30:00.000Z",
      "isActive": true,
      "hasPassword": false
    },
    {
      "roomId": "XYZ789", 
      "question": "Món ăn yêu thích của bạn?",
      "totalVotes": 8,
      "createdAt": "2025-08-14T10:25:00.000Z",
      "isActive": true,
      "hasPassword": true
    }
  ],
  "total": 2
}
```

## Security Considerations

1. **Rate Limiting**: Limit API calls to prevent abuse
2. **No Password Exposure**: Never return actual passwords
3. **Active Rooms Only**: Only show currently active rooms
4. **Time Limits**: Auto-expire old rooms
5. **Pagination**: Implement pagination for large lists

## Optional Enhancements

1. **Search/Filter**: Allow filtering by question keywords
2. **Categories**: Add room categories
3. **Popularity**: Sort by vote count or recent activity
4. **Room Metadata**: Description, tags, creator info
5. **Analytics**: Track room popularity and engagement

## CORS Configuration

Make sure CORS is configured in `Program.cs`:

```csharp
app.UseCors(builder => builder
    .WithOrigins("http://localhost:5173", "http://localhost:5174") // Vite dev server
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());
```
