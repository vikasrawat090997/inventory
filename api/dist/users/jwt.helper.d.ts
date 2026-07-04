export declare class JwtHelper {
    private static readonly SECRET;
    private static base64url;
    static sign(payload: any, expiresInSeconds?: number): string;
    static verify(token: string): any;
}
