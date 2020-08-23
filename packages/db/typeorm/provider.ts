import { Connection } from "typeorm"

class DatabaseProvider {
   constructor(private readonly connection: Connection) {}
}
