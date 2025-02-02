import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import crypto from 'node:crypto';
import Buffer from "node:buffer";
const algorithm = 'AES-CBC';

export class Encrypt extends OpenAPIRoute {
    schema = {
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            plaintext: z.string().base64(), // 512 bit password hash
                        })
                    }
                }
            }
        }
    };

    async handle(c) {
        // Get validated data
        const data = await this.getValidatedData<typeof this.schema>();

        const key = c.env.SECRET

        const { iv, ciphertext } = await aesEncrypt(data.body.plaintext, key);

        return {
            success: true,
            result: {
                data: ciphertext,
                iv: iv
            }
        };
    }
}

async function aesEncrypt(plaintext: string, key: string) {
    const ec = new TextEncoder();

    const key_buffer = Buffer.Buffer.from(key, 'hex');

    const cryptoKey = await crypto.webcrypto.subtle.importKey("raw", key_buffer, algorithm, true, ["encrypt"]);

    const iv = crypto.webcrypto.getRandomValues(new Uint8Array(16));

    const ciphertext = await crypto.webcrypto.subtle.encrypt({
        name: algorithm,
        iv,
    }, cryptoKey, ec.encode(plaintext));

    console.log(ec, cryptoKey, iv, ciphertext);

    return {
        iv: Buffer.Buffer.from(iv).toString('base64'),
        ciphertext: Buffer.Buffer.from(ciphertext).toString('base64'),
    };
}
function toHexString(byteArray: ArrayBuffer) {
    let s = '';
    new Uint8Array(byteArray).forEach(function(byte) {
        s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
    });
    return s;
}