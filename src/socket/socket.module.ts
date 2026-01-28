import { Module } from '@nestjs/common';
import { AppGateway } from './socket.gateway';

//==================================================================================
//                               SOCKET MODULE (BACKEND)
//==================================================================================
// Description: Organizes socket-related components (Gateways, Providers).
//==================================================================================

@Module({
  providers: [AppGateway],
  exports: [AppGateway],
})
export class SocketModule {}
