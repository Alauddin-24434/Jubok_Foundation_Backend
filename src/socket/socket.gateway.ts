import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

//==================================================================================
//                               SOCKET GATEWAY (BACKEND)
//==================================================================================

@WebSocketGateway({
  cors: {
    origin: '*', // Production এ frontend URL রাখো
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server;

  private logger: Logger = new Logger('AppGateway');

  // ==================== STATIC SERVER REFERENCE ====================
  static io: Server;

  afterInit(server: Server) {
    AppGateway.io = server; // 🔥 Service থেকে use করার জন্য static
    this.logger.log('Socket.io Gateway Initialized');
  }

  // ==================== CONNECTION ====================
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);

    // Welcome message
    client.emit('welcome', {
      message: 'Welcome to Alhamdulillah Foundation Real-time Server',
      id: client.id,
    });
  }

  // ==================== DISCONNECTION ====================
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ==================== EVENT HANDLERS ====================

  // Global notifications
  @SubscribeMessage('send_notification')
  handleNotification(@MessageBody() data: any): void {
    this.logger.log(`Notification received: ${JSON.stringify(data)}`);
    this.server.emit('receive_notification', data);
  }

  // Room join for projects
  @SubscribeMessage('join_project_room')
  handleJoinRoom(client: Socket, projectId: string): void {
    client.join(projectId);
    this.logger.log(`Client ${client.id} joined room: ${projectId}`);
    client.emit('joined_room', projectId);
  }

  @SubscribeMessage('project_update')
  handleProjectUpdate(@MessageBody() data: { projectId: string; update: any }): void {
    this.server.to(data.projectId).emit('project_data_updated', data.update);
  }

  // Room join for single user
  @SubscribeMessage('join_user_room')
  handleJoinUserRoom(client: Socket, userId: string): void {
    client.join(userId);
    this.logger.log(`Client ${client.id} joined user room: ${userId}`);
    client.emit('joined_user_room', userId);
  }

  // ==================== HELPER METHODS ====================
  // Admin notification
  sendAdminNotification(data: any) {
    this.server.to('admin').emit('admin_notification', data);
  }

  // Public notification (everyone)
  static sendPublicNotification(data: any) {
    if (AppGateway.io) {
      AppGateway.io.emit('public_notification', data);
    } else {
      console.warn('⚠️ Socket server not initialized yet');
    }
  }

  // Single user notification
  sendUserNotification(userId: string, data: any) {
    this.server.to(userId).emit('user_notification', data);
  }
}
