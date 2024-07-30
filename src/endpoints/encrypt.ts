import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Task } from "../types";
import {createCipheriv, randomFill, scrypt} from "node:crypto";

const algorithm = 'aes-256-ctr';

export class Encrypt extends OpenAPIRoute {
    schema = {
        summary: "Decrypts given data using the secret key",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            encrypted: z.string()
                        }),
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Returns decrypted data",
                content: {
                    "application/json": {
                        schema: z.object({
                            series: z.object({
                                success: Bool(),
                                result: z.object({
                                    data: z.string(),
                                    iv: z.string().length(32),
                                }),
                            }),
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

        // Retrieve the validated request body
        const iv = Buffer.alloc(128);

        crypto.getRandomValues(iv);


        const cipher = createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data.body.encrypted, "hex", "hex");
        encrypted += cipher.final("hex");

        return {
            success: true,
            result: {
                data: encrypted,
                iv: iv
            }
        };
    }
}
