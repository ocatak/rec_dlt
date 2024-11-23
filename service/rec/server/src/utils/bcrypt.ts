import bcrypt from 'bcryptjs';

// Function to hash a password
export async function hashPassword(plainTextPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    const hashedPassword = await bcrypt.hash(plainTextPassword, salt); // Hash the password with the salt
    return hashedPassword;
}

// Function to compare a plain text password with a hashed password
export async function comparePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
    return isMatch;
}