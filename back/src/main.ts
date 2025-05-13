import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Utilisation de l'adaptateur Socket.IO
  app.useWebSocketAdapter(new IoAdapter(app));
  
  // Configuration CORS plus permissive
  app.enableCors({
    origin: true, // Autorise toutes les origines
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application démarrée sur le port ${port}`);
}
bootstrap();
