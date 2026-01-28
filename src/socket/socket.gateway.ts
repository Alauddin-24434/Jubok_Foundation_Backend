import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

//==================================================================================
//                               SOCKET GATEWAY (BACKEND)
//==================================================================================
// Description: Handles real-time communication using Socket.io.
// Features: Connection management, event broadcasting, and room-based messaging.
//==================================================================================

@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace with your frontend URL
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  //======================   INIT   ===============================
  afterInit(server: Server) {
    this.logger.log('Socket.io Gateway Initialized');
  }

  //======================   CONNECTION   ===============================
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Welcome message to the connected client
    client.emit('welcome', {
      message: 'Welcome to Alhamdulillah Foundation Real-time Server',
      id: client.id,
    });
  }

  //======================   DISCONNECTION   ===============================
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  //======================   EVENT HANDLERS   ===============================

  // Example: Handle global notifications
  @SubscribeMessage('send_notification')
  handleNotification(@MessageBody() data: any): void {
    this.logger.log(`Notification received: ${JSON.stringify(data)}`);
    // Broadcast to everyone else
    this.server.emit('receive_notification', data);
  }

  // Example: Handle project-specific updates (using rooms)
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

  @SubscribeMessage('join_user_room')
  handleJoinUserRoom(client: Socket, userId: string): void {
    client.join(userId);
    this.logger.log(`Client ${client.id} joined user room: ${userId}`);
    client.emit('joined_user_room', userId);
  }
}
