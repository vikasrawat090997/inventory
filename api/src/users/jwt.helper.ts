import * as crypto from 'crypto';

export class JwtHelper {
  private static readonly SECRET = 'rxkeep_super_secret_jwt_key_123456';

  private static base64url(source: Buffer | string): string {
    const encoded = typeof source === 'string' ? Buffer.from(source).toString('base64') : source.toString('base64');
    return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  static sign(payload: any, expiresInSeconds = 86400): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const finalPayload = { ...payload, exp };
    
    const headerEncoded = this.base64url(JSON.stringify(header));
    const payloadEncoded = this.base64url(JSON.stringify(finalPayload));
    
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;
    const hmac = crypto.createHmac('sha256', this.SECRET);
    hmac.update(signatureInput);
    const signatureEncoded = this.base64url(hmac.digest());
    
    return `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`;
  }

  static verify(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
      const signatureInput = `${headerEncoded}.${payloadEncoded}`;
      
      const hmac = crypto.createHmac('sha256', this.SECRET);
      hmac.update(signatureInput);
      const computedSignature = this.base64url(hmac.digest());
      
      if (computedSignature !== signatureEncoded) return null;
      
      // Decode payload
      const payloadDecoded = Buffer.from(payloadEncoded, 'base64').toString('utf8');
      const payload = JSON.parse(payloadDecoded);
      
      // Check expiration
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return null;
      }
      
      return payload;
    } catch (e) {
      return null;
    }
  }
}
