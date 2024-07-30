import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Task } from "../types";
import {createDecipheriv, randomFill, scrypt} from "node:crypto";

const algorithm = 'aes-256-ctr';

export class Decrypt extends OpenAPIRoute {
    schema = {
        summary: "Decrypts given data using the secret key",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            iv: z.string().length(32),
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
        const iv = Buffer.from(data.body.iv, "hex");

        const decipher = createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(data.body.encrypted, "hex", "hex");
        decrypted += decipher.final("hex");

        return {
            success: true,
            result: {
                data: decrypted
            }
        };
    }
}
