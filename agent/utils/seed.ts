/**
 * The function generates a random string of a specified length using a given character set.
 * @param {number} length - The `length` parameter in the `generateRandomString` function is the
 * desired length of the random string that you want to generate.
 * @returns The function `generateRandomString` returns a randomly generated string of the specified
 * length.
 */
export function generateRandomString(length: number) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    return result;
}

/**
 * The function `validateSeed` checks the length of a seed string and adjusts it if necessary, or
 * throws an error if the length is greater than 32.
 * @param {string} seed - The `seed` parameter is a string that represents a seed value.
 * @returns the seed value after validating it. If the length of the seed is less than 32, the function
 * adds leading zeros to make it 32 characters long. If the length of the seed is greater than 32, an
 * error is thrown. Otherwise, the original seed value is returned.
 */
export function validateSeed(seed:string){
    if (seed.length < 32) {
        const adjustedSeed = '0'.repeat(32 - seed.length) + seed.toString();
        return adjustedSeed;
      } else if(seed.length >32 ) {
        throw new Error("Seed value should not be greater than 32.");
      }
      return seed
}