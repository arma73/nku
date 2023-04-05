import sqlite3 from "sqlite3";

import type { Database } from "sqlite3";

class DB {
    private static instance: DB;
    private _db: Database;
  
    private constructor() {
      this._db = new sqlite3.Database("mqtt.sqlite");
    }
  
    public static getInstance(): DB {
      if (!DB.instance) {
        DB.instance = new DB();
      }
      return DB.instance;
    }
  
    public get db(): Database {
      return this._db;
    }
}

export default DB.getInstance().db;