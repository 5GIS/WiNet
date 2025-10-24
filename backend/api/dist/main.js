"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./modules/app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors();
    const port = process.env.PORT || 5000;
    await app.listen(port, '0.0.0.0');
    console.log(`API running on http://0.0.0.0:${port}`);
    console.log(`Modules loaded: Auth, Routers, Offers, Tickets, Payments, Themes, Technicians, Shop`);
}
bootstrap();
