import { redis } from "../config/redis.js";

const OTP_TTL = 300;
const MAX_ATTEMPTS = 3;

const verifyAndDeleteScript = `
  local input_hash = ARGV[1]
  local max_attempts = tonumber(ARGV[2])
  local ttl = tonumber(ARGV[3])

  local stored_hash = redis.call("HGET", KEYS[1], "otp")
  local attempts = tonumber(redis.call("HGET", KEYS[1], "attempts")) or 0

  if attempts >= max_attempts then
    redis.call("DEL", KEYS[1])
    return -1
  end

  if stored_hash == input_hash then
    redis.call("DEL", KEYS[1])
    return 1
  else
    redis.call("HINCRBY", KEYS[1], "attempts", 1)
    redis.call("EXPIRE", KEYS[1], ttl)
    return 0
  end
`;

export const saveOtp = async (identifier: string, hashedOtp: string) => {
  const key = `login_otp:${identifier}`;
  await redis.hset(key, "otp", hashedOtp, "attempts", 0);
  await redis.expire(key, OTP_TTL);
};

export const consumeOtp = async (
  identifier: string,
  hashedOtp: string,
): Promise<number> => {
  const key = `login_otp:${identifier}`;

  const result = await redis.eval(
    verifyAndDeleteScript,
    1,
    key,
    hashedOtp,
    MAX_ATTEMPTS.toString(),
    OTP_TTL.toString(),
  );

  return result as number;
};
