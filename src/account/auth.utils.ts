import * as bcrypt from 'bcrypt';

export async function generateSaltAndHash(password: string): Promise<{ salt: string, hashPassword: string }> {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    return { salt, hashPassword };
}

export async function validatePassword(password: string, hash: string, salt: string): Promise<boolean> {
    const hashPassword = await bcrypt.hash(password, salt);
    return hash === hashPassword;
}