// view
export interface ConnectionMapEntry {
    connection: RoomConnection;
    inMap: boolean;
}

// model
export class RoomConnection {

    id: string;
    roomA: string;
    roomB: string;
    a2bDirections: string[];
    b2aDirections: string[];

    constructor(id: string, roomA: string, roomB: string) {
        if (roomB < roomA) {
            throw "Invalid connection, roomA must be less than roomB"
        }
        this.id = roomA + ":" + roomB;
        this.roomA = roomA;
        this.roomB = roomB;
        this.a2bDirections = [];
        this.b2aDirections = [];
    }

    public numWaysToGoA2B() {
        return this.a2bDirections ? this.a2bDirections.length : 0;
    }

    public numWaysToGoB2A() {
        return this.b2aDirections ? this.b2aDirections.length : 0;
    }

    public canGoA2B(): boolean {
        return (this.numWaysToGoA2B() > 0);
    }

    public canGoB2A(): boolean {
        return (this.numWaysToGoB2A() > 0);
    }

    public getLabelForMainDir(mainDir: string) {
        if (["NORTH", "SOUTH", "EAST", "WEST", "NE", "NW", "SE", "SW"].includes(mainDir)) {
            return ""; // direction is obvious
        }
        return mainDir.substring(0, 1).toLowerCase();
    }

    // TODO: Add option to explicitly show label
    // TODO: Add option to show labels for multiple options, like "NORTH,NE"
    public getLabelA() {
        let numWays = this.numWaysToGoA2B();
        if (numWays == 0) {
            return "x"; // can't go in that direction
        }
        let mainDir = this.getPreferredDirection(this.roomA);
        return this.getLabelForMainDir(mainDir);
    }

    public getLabelB() {
        let numWays = this.numWaysToGoB2A();
        if (numWays == 0) {
            return "x"; // can't go in that direction
        }
        let mainDir = this.getPreferredDirection(this.roomB);
        return this.getLabelForMainDir(mainDir);
    }

    public getPreferredDirection(roomId: string): string {
        if (!(roomId == this.roomA || roomId == this.roomB)) {
            throw "getPreferredDirection(): roomId " + roomId + " not part of this connection.";
        }
        if (roomId == this.roomA) {
            if (this.a2bDirections && this.a2bDirections.length > 0) {
                return this.a2bDirections[0];
            }
        }
        if (roomId == this.roomB) {
            if (this.b2aDirections && this.b2aDirections.length > 0) {
                return this.b2aDirections[0];
            }
        }
        // TODO: smarter, find an "open direction"
        if (roomId == "FOREST-1") return "SE";
        if (roomId == "FOREST-2") return "NORTH";
        if (roomId == "FOREST-3") return "EAST";
        return "WEST";
    }

    public addDirection(roomId1: string, roomId2: string, direction: string) {
        if (roomId1 == this.roomA && roomId2 == this.roomB) {
            this.a2bDirections.push(direction);
        } else if (roomId1 == this.roomB && roomId2 == this.roomA) {
            this.b2aDirections.push(direction);
        }
    }
};
