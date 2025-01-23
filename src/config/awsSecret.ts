import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import dotenv from 'dotenv';

dotenv.config();

const secretsManager = new SecretsManager({
  region: process.env.AWS_REGION || 'us-east-1'
});


async function getAuthSecret(): Promise<string> {
  const isLocal = process.env.NODE_ENV === 'development';
  if (isLocal) {
    return process.env.SECRET || 'SECRET';
  }

  try {
    const secretName = 'socialMedia/jwtSecret';
    const secret = await secretsManager.getSecretValue({ SecretId: secretName });

    if ('SecretString' in secret) {
      const parsedSecret = JSON.parse(secret.SecretString || '');
      return parsedSecret.JWT_SECRET;
    } else {
      throw new Error('SecretString not found on AWS response');
    }
  } catch (error) {
    console.error('Error finding aws secret', error);
    throw error;
  }
}

async function getRefreshSecret(): Promise<string> {
  const isLocal = process.env.NODE_ENV === 'development';
  if (isLocal) {
    return process.env.SECRET || 'SECRET';
  }

  try {
    const secretName = 'socialMedia/jwtSecret';
    const secret = await secretsManager.getSecretValue({ SecretId: secretName });

    if ('SecretString' in secret) {
      const parsedSecret = JSON.parse(secret.SecretString || '');
      return parsedSecret.JWT_SECRET;
    } else {
      throw new Error('SecretString not found on AWS response');
    }
  } catch (error) {
    console.error('Error finding aws secret', error);
    throw error;
  }
}

export { getAuthSecret, getRefreshSecret };