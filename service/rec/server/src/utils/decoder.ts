export function bufferToJSON(buffer: Uint8Array) {
    const decoder = new TextDecoder();
    const decodedString = decoder.decode(buffer);
    return JSON.parse(decodedString);

}