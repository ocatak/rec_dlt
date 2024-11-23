import RedisSingleton, { Channel } from './src/helper/cache';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  for (let i = 0; i < 10; i++) {
    await RedisSingleton.getInstance().publish(Channel.SINGLE_PROCESS, JSON.stringify({
      // random uuid
      connectionId: '550e8400-e29b-41d4-a716-446655440003',
      organizationId: '123e4567-e89b-12d3-a456-426614174003',
      message: 'client@rec.com,1713948714578,1,2',
    }));

    console.log(`Message ${i + 1} published`);

    // Wait for 5 seconds before next iteration
    await delay(5000);
  }
}

void main();
