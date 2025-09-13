"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: true,
        rawBody: true,
    });
    app.use(require('express').json({ limit: '50mb' }));
    app.use(require('express').urlencoded({ limit: '50mb', extended: true }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3000'
        ],
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('TrustBridge API')
        .setDescription('Real-World Asset Tokenization Platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Assets', 'Asset management endpoints')
        .addTag('Investments', 'Investment management endpoints')
        .addTag('Verification', 'Asset verification endpoints')
        .addTag('Attestors', 'Attestor management endpoints')
        .addTag('Chainlink', 'Chainlink oracle endpoints')
        .addTag('Hedera', 'Hedera blockchain endpoints')
        .addTag('Analytics', 'Analytics and reporting endpoints')
        .addTag('Portfolio', 'Portfolio management endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
        customSiteTitle: 'TrustBridge API Documentation',
        customCss: '.swagger-ui .topbar { display: none }',
    });
    const port = process.env.PORT || 4001;
    await app.listen(port);
    console.log(`🚀 TrustBridge Server running on http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
    console.log(`💚 Hedera + Chainlink integration: ACTIVE`);
    console.log(`🌍 REST API endpoints: http://localhost:${port}/api`);
    console.log(`🎮 GraphQL playground: http://localhost:${port}/graphql`);
    console.log(`🔌 WebSocket subscriptions: ws://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map