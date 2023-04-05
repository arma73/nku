import db from "./db";
import { MQTT_TOPIC } from "./consts";
import { MQTT_ONE_USERNAME, MQTT_ONE_PASSWORD } from "$env/static/private";

import type { PageServerLoad } from "./$types";
import type { Database } from "sqlite3";

export const prerender = true;

export interface TopicValue {
    topic: string;
    value: number | undefined;
}

/**
 * Creates the "power" table in the database if it doesn't exist.
 *
 * @param db - The database to create the table in.
 * @returns A promise that resolves when the table is created.
 */
async function createPowerTable(db: Database): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        db.run(
            "CREATE TABLE IF NOT EXISTS power (topic TEXT PRIMARY KEY, value INTEGER)",
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    })
}

/**
 * Retrieves the value associated with a specific MQTT topic from the database.
 *
 * @param db - The database to retrieve the value from.
 * @param topic - The MQTT topic to retrieve the value for.
 * @returns A promise that resolves with the value associated with the topic, or `undefined` if no value is found.
 */
async function getTopicValue(
    db: Database,
    topic: string
): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
        const query = `SELECT value FROM power WHERE topic = '${topic}'`;
        db.get<TopicValue>(query, (err, row) => {
            if (err) {
                reject(err);
            } else if (!row) {
                resolve(undefined);
            } else {
                resolve(row.value);
            }
        });
    });
}

export const load = (async () => {
    await createPowerTable(db);
    const value = await getTopicValue(db, MQTT_TOPIC);

    return {
        value,
        username: MQTT_ONE_USERNAME,
        password: MQTT_ONE_PASSWORD,
    };
}) satisfies PageServerLoad;
