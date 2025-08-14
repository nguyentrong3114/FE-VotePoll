import * as signalR from "@microsoft/signalr";

export interface PollData {
    question: string;
    options: Record<string, number>;
}

export interface JoinRoomResult {
    success: boolean;
    message?: string;
    poll?: PollData;
    requiresPassword?: boolean;
}

export interface ActivityEvent {
    id: string;
    type: 'join' | 'vote' | 'leave';
    userId: string;
    userName?: string;
    message: string;
    timestamp: Date;
    data?: any;
}

export interface UserInfo {
    userId: string;
    userName?: string;
    connectionId: string;
    joinedAt: Date;
    hasVoted: boolean;
    votedOption?: string;
}

export class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private hubUrl: string;

    constructor(baseUrl: string) {
        this.hubUrl = `${baseUrl.replace(/\/$/, "")}/pollHub`;
    }

    async connect(): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(this.hubUrl)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        try {
            await this.connection.start();
            console.log("SignalR connected successfully");
        } catch (error) {
            console.error("SignalR connection failed:", error);
            throw error;
        }
    }

    async ensureConnection(): Promise<void> {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            await this.connect();
        }
    }

    onPollUpdated(callback: (poll: PollData) => void): void {
        this.connection?.on("PollUpdated", callback);
    }

    onJoinSuccess(callback: (data: { message: string; roomId: string }) => void): void {
        this.connection?.on("JoinSuccess", callback);
    }

    onJoinError(callback: (data: { message: string; errorCode: string }) => void): void {
        this.connection?.on("JoinError", callback);
    }

    onActivityUpdate(callback: (activity: ActivityEvent) => void): void {
        this.connection?.on("ActivityUpdate", callback);
    }

    onUserListUpdate(callback: (users: UserInfo[]) => void): void {
        this.connection?.on("UserListUpdate", callback);
    }

    onUserJoined(callback: (user: UserInfo) => void): void {
        this.connection?.on("UserJoined", callback);
    }

    onUserLeft(callback: (userId: string) => void): void {
        this.connection?.on("UserLeft", callback);
    }

    onUserVoted(callback: (data: { userId: string; option: string; userName?: string }) => void): void {
        this.connection?.on("UserVoted", callback);
    }

    onClose(callback: () => void): void {
        this.connection?.onclose(callback);
    }

    async joinRoom(roomId: string, password?: string): Promise<JoinRoomResult> {
        if (!this.connection) throw new Error("Not connected");

        return new Promise((resolve, reject) => {
            // Set up one-time event listeners
            const handleJoinSuccess = (data: { message: string; roomId: string }) => {
                this.connection?.off("JoinSuccess", handleJoinSuccess);
                this.connection?.off("JoinError", handleJoinError);
                resolve({ success: true, message: data.message });
            };

            const handleJoinError = (data: { message: string; errorCode: string }) => {
                this.connection?.off("JoinSuccess", handleJoinSuccess);
                this.connection?.off("JoinError", handleJoinError);
                
                if (data.errorCode === "WRONG_PASSWORD") {
                    resolve({
                        success: false,
                        requiresPassword: true,
                        message: "Phòng này yêu cầu mật khẩu hoặc mật khẩu không đúng"
                    });
                } else if (data.errorCode === "ROOM_NOT_FOUND") {
                    resolve({
                        success: false,
                        message: "Phòng không tồn tại. Vui lòng kiểm tra mã phòng."
                    });
                } else {
                    resolve({
                        success: false,
                        message: data.message || "Không thể tham gia phòng"
                    });
                }
            };

            // Register event listeners
            this.connection?.on("JoinSuccess", handleJoinSuccess);
            this.connection?.on("JoinError", handleJoinError);

            // Set timeout to avoid hanging
            const timeout = setTimeout(() => {
                this.connection?.off("JoinSuccess", handleJoinSuccess);
                this.connection?.off("JoinError", handleJoinError);
                reject(new Error("Join room timeout"));
            }, 10000);

            // Send join request
            this.connection?.invoke("JoinRoom", roomId, password)
                .then(() => {
                    console.log(`Join request sent for room: ${roomId}${password ? ' with password' : ' without password'}`);
                })
                .catch((error) => {
                    clearTimeout(timeout);
                    this.connection?.off("JoinSuccess", handleJoinSuccess);
                    this.connection?.off("JoinError", handleJoinError);
                    console.error("JoinRoom invoke error:", error);
                    reject(error);
                });
        });
    }

    async vote(roomId: string, option: string): Promise<boolean> {
        if (!this.connection) throw new Error("Not connected");

        try {
            console.log(`Attempting to vote in room: ${roomId}, option: ${option}`);

            // Với backend hiện tại, Vote method không trả về gì qua invoke
            // Chỉ gửi PollUpdated event khi thành công
            await this.connection.invoke("Vote", roomId, option);
            
            console.log("Vote request sent successfully");
            
            // Giả định vote thành công nếu không có exception
            return true;
        } catch (error: any) {
            console.error("Vote error:", error);
            return false;
        }
    }

    async disconnect(): Promise<void> {
        await this.connection?.stop();
        this.connection = null;
    }

    get isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }
}
