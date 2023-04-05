import { json } from "@sveltejs/kit";
import db from "../../db";

interface PowerRequestBody {
    topic: string;
    powerValue: number;
}

async function savePowerValueToDatabase(
    topic: string,
    value: number
): Promise<void> {
    const query = `INSERT OR REPLACE INTO power (topic, value) VALUES (?, ?)`;

    return new Promise<void>((resolve, reject) => {
        db.run(query, [topic, value], err => {
            if (err) {
                console.error("Error saving to database:", err);
                reject(err);
            } else {
                console.log(
                    `Value (${value}) and topic (${topic}) saved to database`
                );
                resolve();
            }
        });
    });
}

export async function POST({
    request,
}: {
    request: { json: () => Promise<PowerRequestBody> };
}) {
    const { topic, powerValue } = await request.json();

    if (!topic || !powerValue) {
        return json(
            { message: "Invalid request" },
            {
                status: 400,
            }
        );
    }

    await savePowerValueToDatabase(topic, powerValue);

    return json(
        {
            message: "Successfully!",
        },
        {
            status: 200,
        }
    );
}

export async function DELETE() {
    async function clearDatabase(): Promise<void> {
        const query = "DROP TABLE IF EXISTS power;";

        return new Promise<void>((resolve, reject) => {
            db.run(query, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    await clearDatabase();
}
