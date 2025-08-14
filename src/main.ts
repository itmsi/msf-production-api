import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/exceptions/all-exception.exception';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  app.setGlobalPrefix('api');
  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('MSF Production API')
    .setDescription('API documentation for the MSF Production System with User Management')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Roles', 'Role management endpoints')
    .addTag('Permission', 'Permission management endpoints')
    .addTag('Menu', 'Menu management endpoints')
    .addTag('Menu Has Permission', 'Menu permission management endpoints')
    .addTag('Role Has Permission', 'Role permission management endpoints')
    .addTag('User Role', 'User role assignment endpoints')
    .addTag('Sites', 'Site management endpoints')
    .addTag('Employee', 'Employee management endpoints')
    .addTag('Brand', 'Brand management endpoints')
    .addTag('Unit Type', 'Unit type management endpoints')
    .addTag('Activities', 'Activities management endpoints')
    .addTag('Population', 'Population management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'jwt', // This is the name used for @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // http://localhost:3000/docs
  app.enableCors({
    origin: ['*'],
    methods: 'GET,POST,PUT,DELETE',
    credentials: true, // allow cookies / Authorization header
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggerInterceptor());
  if (process.env.STRICT_VALIDATION === 'yes') {
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        exceptionFactory: (errors) => {
          const firstError = errors[0];
          const constraint = firstError?.constraints
            ? Object.values(firstError.constraints)[0]
            : 'Invalid input';
          return new BadRequestException(constraint);
        },
      }),
    );
  }
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
