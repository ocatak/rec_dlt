export function encodeToBase64(inputString: string): string {
    const buffer = Buffer.from(inputString, 'utf-8');
    return buffer.toString('base64');
}