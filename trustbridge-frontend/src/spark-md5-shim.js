// SparkMD5 shim for browser compatibility
import * as SparkMD5 from 'spark-md5';

// Export as default to match the expected import
export default SparkMD5;

// Also export named exports
export const { ArrayBuffer, SparkMD5: SparkMD5Class } = SparkMD5;
