import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import Buffer from "node:buffer";
import crypto from "node:crypto";

const algorithm = 'AES-CBC';

export class Decrypt extends OpenAPIRoute {
    schema = {
        summary: "Decrypts given data using the secret key",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            ciphertext: z.string().regex(/[0-9A-Fa-f]{6}/g), // Require both strings to be hex
                            iv: z.string().regex(/[0-9A-Fa-f]{6}/g),
                        }),
                    },
                },
            },
        },
    };

    async handle(c) {
        // Get validated data
        const data = await this.getValidatedData<typeof this.schema>();

        const key = c.env.SECRET

        try {
            const decrypted = await aesDecrypt(data.body.ciphertext, key, data.body.iv);

            return {
                success: true,
                result: {
                    plaintext: decrypted
                }
            };

        }
        catch (e) {
            return {
                success: false,
            }
        }
    }
}

async function aesDecrypt(ciphertext: string, key: string, iv: string) {
    const dec = new TextDecoder();

    const key_buffer = Buffer.Buffer.from(key, 'hex');

    const cryptoKey = await crypto.webcrypto.subtle.importKey("raw", key_buffer, algorithm, true, ["decrypt"]);

    const plaintext = await crypto.subtle.decrypt({
        name: algorithm,
        iv: Buffer.Buffer.from(iv, 'hex'),
    }, cryptoKey, Buffer.Buffer.from(ciphertext, 'hex'));

    return dec.decode(plaintext);
}