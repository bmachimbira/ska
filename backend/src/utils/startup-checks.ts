/**
 * Startup Validation Checks
 * Ensures critical services and configuration are available before starting the server
 */

import * as Minio from 'minio';

/**
 * Validate Mux environment variables
 * Mux is optional - only warns if not configured
 */
export function validateMuxCredentials(): void {
  const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
  const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

  const errors: string[] = [];

  if (!MUX_TOKEN_ID) {
    errors.push('MUX_TOKEN_ID is not set');
  } else if (MUX_TOKEN_ID === 'your-mux-token-id') {
    errors.push('MUX_TOKEN_ID is set to placeholder value');
  }

  if (!MUX_TOKEN_SECRET) {
    errors.push('MUX_TOKEN_SECRET is not set');
  } else if (MUX_TOKEN_SECRET === 'your-mux-token-secret') {
    errors.push('MUX_TOKEN_SECRET is set to placeholder value');
  }

  if (errors.length > 0) {
    console.log(
      '⚠️  Mux configuration warning:\n  - ' + errors.join('\n  - ') + '\n' +
      '   Video upload features will be disabled.\n' +
      '   Get credentials at: https://dashboard.mux.com/settings/access-tokens'
    );
    return;
  }

  console.log('✓ Mux credentials validated');
}

/**
 * Validate MinIO connection
 * @throws Error if MinIO is not reachable
 */
export async function validateMinioConnection(): Promise<void> {
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = parseInt(process.env.MINIO_PORT || '9000');
  const useSSL = process.env.MINIO_USE_SSL === 'true';
  const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
  const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';

  try {
    const minioClient = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    // Try to list buckets as a connectivity check
    await minioClient.listBuckets();

    console.log(`✓ MinIO connection validated (${useSSL ? 'https' : 'http'}://${endpoint}:${port})`);
  } catch (error) {
    const protocol = useSSL ? 'https' : 'http';
    throw new Error(
      `MinIO connection failed: ${protocol}://${endpoint}:${port}\n\n` +
      'Ensure MinIO is running and credentials are correct.\n' +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Run all startup checks
 * @throws Error if any check fails
 */
export async function runStartupChecks(): Promise<void> {
  console.log('\n🔍 Running startup validation checks...\n');

  try {
    // Check Mux credentials
    validateMuxCredentials();

    // Check MinIO connection
    await validateMinioConnection();

    console.log('\n✅ All startup checks passed!\n');
  } catch (error) {
    console.error('\n❌ Startup validation failed:\n');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    console.error('');
    throw error;
  }
}
