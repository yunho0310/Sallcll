import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('AppModule (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/api/users (POST) creates a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send({ name: '홍길동', email: 'hong@example.com' })
      .expect(201);

    expect(response.body).toMatchObject({
      name: '홍길동',
      email: 'hong@example.com',
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
