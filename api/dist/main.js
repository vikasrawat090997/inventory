"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('RxKeep API')
        .setDescription('The RxKeep Pharmacy Inventory & Sales Management system backend API description')
        .setVersion('1.0')
        .addTag('medicines')
        .addTag('sales')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    await app.listen(4000);
    console.log(`Application is running on: http://localhost:4000`);
    console.log(`Swagger Docs available at: http://localhost:4000/api-docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map