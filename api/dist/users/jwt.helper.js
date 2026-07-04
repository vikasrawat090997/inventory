"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtHelper = void 0;
const crypto = require("crypto");
class JwtHelper {
    static base64url(source) {
        const encoded = typeof source === 'string' ? Buffer.from(source).toString('base64') : source.toString('base64');
        return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }
    static sign(payload, expiresInSeconds = 86400) {
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
    static verify(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3)
                return null;
            const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
            const signatureInput = `${headerEncoded}.${payloadEncoded}`;
            const hmac = crypto.createHmac('sha256', this.SECRET);
            hmac.update(signatureInput);
            const computedSignature = this.base64url(hmac.digest());
            if (computedSignature !== signatureEncoded)
                return null;
            const payloadDecoded = Buffer.from(payloadEncoded, 'base64').toString('utf8');
            const payload = JSON.parse(payloadDecoded);
            if (payload.exp && Date.now() / 1000 > payload.exp) {
                return null;
            }
            return payload;
        }
        catch (e) {
            return null;
        }
    }
}
exports.JwtHelper = JwtHelper;
JwtHelper.SECRET = 'rxkeep_super_secret_jwt_key_123456';
//# sourceMappingURL=jwt.helper.js.map