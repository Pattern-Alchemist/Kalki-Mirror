import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { db } from '../db';

/** Generate a new TOTP secret and QR code data URL for the user */
export async function generate2FASecret(userId: string, email: string) {
  const secret = new OTPAuth.Secret();
  const totp = new OTPAuth.TOTP({
    issuer: 'Kalki Mirror',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  const otpauthUrl = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
    width: 256,
    margin: 2,
    color: { dark: '#f4f4f5', light: '#09090b' },
  });

  // Generate 8 backup codes
  const backupCodes = Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  // Store secret (not yet enabled — user must verify first)
  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: secret.base32,
      twoFactorBackupCodes: JSON.stringify(backupCodes),
      twoFactorEnabled: false,
    },
  });

  return { secret: secret.base32, qrDataUrl, backupCodes, otpauthUrl };
}

/** Verify a TOTP code and enable 2FA */
export async function verify2FA(userId: string, code: string): Promise<{ valid: boolean; error?: string }> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorSecret) return { valid: false, error: '2FA not set up' };

  // Check backup codes first
  if (user.twoFactorBackupCodes) {
    const codes: string[] = JSON.parse(user.twoFactorBackupCodes);
    const idx = codes.indexOf(code.toUpperCase());
    if (idx !== -1) {
      // Remove used backup code
      codes.splice(idx, 1);
      await db.user.update({
        where: { id: userId },
        data: { twoFactorBackupCodes: JSON.stringify(codes) },
      });
      return { valid: true };
    }
  }

  // Verify TOTP
  const secret = OTPAuth.Secret.fromBase32(user.twoFactorSecret);
  const totp = new OTPAuth.TOTP({
    issuer: 'Kalki Mirror',
    label: user.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  // Check current and adjacent windows (30s each side) for clock drift
  const delta = totp.validate({ token: code, window: 1 });
  if (delta === null) {
    return { valid: false, error: 'Invalid code' };
  }

  return { valid: true };
}

/** Enable 2FA after successful verification */
export async function enable2FA(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true },
  });
}

/** Disable 2FA */
export async function disable2FA(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
    },
  });
}

/** Check if 2FA is required and validate code during login */
export async function validate2FALogin(userId: string, code: string): Promise<{ valid: boolean; required: boolean; error?: string }> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { valid: false, required: false, error: 'User not found' };

  if (!user.twoFactorEnabled) return { valid: true, required: false };

  const result = await verify2FA(userId, code);
  return { ...result, required: true };
}
