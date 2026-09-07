import { Component, NgZone, OnInit, ChangeDetectorRef } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { ActivatedRoute, ChildrenOutletContexts } from '@angular/router';
import { GameDataReceiver } from '../game-data-receiver';
import { LinkData } from './link-data';
import { RoomConnection, ConnectionMapEntry } from './room-connection';

// @ts-ignore: D3 module is untyped, treating as any
import * as d3 from "../../assets/d3/d3.min.js";

@Component({
  selector: 'app-map-generator',
  templateUrl: './map-generator.component.html',
  styleUrls: ['./map-generator.component.css']
})
export class MapGeneratorComponent implements OnInit, GameDataReceiver {

  public gameId: string;
  public gameData: any;
  public isInitialized: boolean = false;

  //from generic gameData
  public allRooms: any[] = [];

  //used solely for map generation
  public connectionMap: any = null; // "roomId1:roomId2" => {"connection": connectionObj, "inMap": boolean}
  public allNodes: any[] = [];
  public nodeMap: any; // nodeId => node
  public allLinks: any[] = [];
  public linkMap: any; // linkId => link
  public hasProcessedRoomToRoom: any; // "roomId1:roomId2" => true
  public firstRoomId: string = "";
  public ROOM_WIDTH = 100;
  public ROOM_HEIGHT = 100;
  public EXIT_NODE_SIZE = 8;
  public MAP_CENTER_X = 1000;
  public MAP_CENTER_Y = 1000;
  public ROOM_EXIT_PROTRUSION_LENGTH = 90; // from center of room, so 50 = right at room border, 75 = beyond it by 25
  public MIN_INTER_ROOM_DISTANCE = 200;    // from center of room, so 100 = rooms touching, 200 = one room width apart
  public MIN_INTER_LINK_DISTANCE = 50;
  public DELTAS = {
    "NORTH":  {x:    0, y: -this.ROOM_EXIT_PROTRUSION_LENGTH, weight:1.0},
    "SOUTH":  {x:    0, y:  this.ROOM_EXIT_PROTRUSION_LENGTH, weight:1.0},
    "EAST":   {x:  this.ROOM_EXIT_PROTRUSION_LENGTH, y:    0, weight:1.0},
    "WEST":   {x: -this.ROOM_EXIT_PROTRUSION_LENGTH, y:    0, weight:1.0},
    "NW":     {x: -this.ROOM_EXIT_PROTRUSION_LENGTH, y: -this.ROOM_EXIT_PROTRUSION_LENGTH, weight:1.0},
    "NE":     {x:  this.ROOM_EXIT_PROTRUSION_LENGTH, y: -this.ROOM_EXIT_PROTRUSION_LENGTH, weight:1.0},
    "SW":     {x: -this.ROOM_EXIT_PROTRUSION_LENGTH, y:  this.ROOM_EXIT_PROTRUSION_LENGTH, weight:1.0},
    "SE":     {x:  this.ROOM_EXIT_PROTRUSION_LENGTH, y:  this.ROOM_EXIT_PROTRUSION_LENGTH, weight:1.0},
    "UP":     {x:  this.ROOM_EXIT_PROTRUSION_LENGTH, y: -this.ROOM_EXIT_PROTRUSION_LENGTH, weight:0.25},
    "DOWN":   {x: -this.ROOM_EXIT_PROTRUSION_LENGTH, y:  this.ROOM_EXIT_PROTRUSION_LENGTH, weight:0.25},
    "IN":     {x:  this.ROOM_EXIT_PROTRUSION_LENGTH, y: -this.ROOM_EXIT_PROTRUSION_LENGTH, weight:0.25},
    "OUT":    {x: -this.ROOM_EXIT_PROTRUSION_LENGTH, y:  this.ROOM_EXIT_PROTRUSION_LENGTH, weight:0.25},
    "LAUNCH": {x:  0, y:  0, weight:0.25},
    "LAND":   {x:  0, y:  0, weight:0.25}
  };

  public adventureRooms: string[] = [
    "FOYER",
    "HALL",
    "LIBRARY",
    "TOWER",
    "CELLAR",
    "GARDEN",
    "MAZE",
  ];


  public zork1OverworldWest: string[] = [
    "NORTH-OF-HOUSE",

    "PATH",
    "GRATING-CLEARING",

    "WEST-OF-HOUSE",
    "EAST-OF-HOUSE",
    "SOUTH-OF-HOUSE",

    "CLEARING",
    "CANYON-VIEW",

    "FOREST-1",
    "FOREST-2",
    "FOREST-3",
    "UP-A-TREE",
    "MOUNTAINS",
    // "KITCHEN",
    // "LIVING-ROOM",
  ];
  public zork1UnderworldSouth: string[] = [
    "CELLAR",
    "EAST-OF-CHASM",
    "GALLERY",
    "STUDIO",

    "TROLL-ROOM",
    "MAZE-1",
    "EW-PASSAGE",       // west of Round Room

    "ROUND-ROOM",
    "NS-PASSAGE",       // north of Round Room
    "LOUD-ROOM",        // east of Round Room
    "ENGRAVINGS-CAVE",  // se of Round Room
    "NARROW-PASSAGE",   // south of Round Room

    // SOUTH part of map (from Narrow Passage)
    "MIRROR-ROOM-2",
    "WINDING-PASSAGE",
    "TINY-CAVE",

    // SOUTHEAST part of map (from Engravings Cave)
    "DOME-ROOM",
    "TORCH-ROOM",
    "NORTH-TEMPLE",
    "EGYPT-ROOM",
    "SOUTH-TEMPLE",
    "ENTRANCE-TO-HADES",
    "LAND-OF-LIVING-DEAD",

    // NORTH part of map (from North-South passage)
    //"CHASM-ROOM",

  ];

  public zork1UnderworldEast: string[] = [
    "CHASM-ROOM",       // better to put this before EW-PASSAGE
    "NS-PASSAGE",       // north of Round Room
    "ROUND-ROOM",
    "LOUD-ROOM",        // east of Round Room
    "ENGRAVINGS-CAVE",  // se of Round Room
    "NARROW-PASSAGE",   // south of Round Room
    "EW-PASSAGE",       // west of Round Room

    // SOUTHEAST part of map (from Loud Room)
    "DAMP-CAVE",
    "DEEP-CANYON",
    "WHITE-CLIFFS-NORTH",
    "WHITE-CLIFFS-SOUTH",

    // NORTHEAST part of map (from Deep Canyon)
    "DAM-ROOM",
    "RESERVOIR-SOUTH",

  ];

  public zork1Maze: string[] = [
    "TROLL-ROOM",
    "MAZE-1",
    "MAZE-2",
    "MAZE-4", "DEAD-END-1",
    "MAZE-3",

    "MAZE-5", "DEAD-END-2",
    "MAZE-6",
    "MAZE-7",
    "MAZE-9",

    "MAZE-10", "MAZE-11", "MAZE-12", "MAZE-13", "GRATING-ROOM",
    "DEAD-END-4",

    // from MAZE-7
    "MAZE-8", "DEAD-END-3",
    "MAZE-14",
    "MAZE-15",
    "CYCLOPS-ROOM",
    "TREASURE-ROOM",
    "STRANGE-PASSAGE"

  ];

  public zork2StartingArea: string[] = [
    "INSIDE-BARROW",
    "NARROW-TUNNEL",
    "FOOT-BRIDGE",
    "GREAT-CAVERN",
    "SHALLOW-FORD",
    "DARK-TUNNEL",
    "GARDEN-NORTH",
    "STREAM-PATH",

  ];

  public zork2CarouselArea: string[] = [
    "CAROUSEL-ROOM",
    "COOL-ROOM",
    "MARBLE-HALL",
    "STREAM-PATH",
    "TOPIARY-ROOM",
    "RIDDLE-ROOM",
    "MENHIR-ROOM",
    "COBWEBBY-CORRIDOR",
    "ROOM-8",

    "PEARL-ROOM",
    "WELL-BOTTOM",

    "FORMAL-GARDEN",
    "GARDEN-NORTH",
    "GAZEBO-ROOM",
    "DARK-TUNNEL",
  ];

  public roomsInMap: string[] = this.zork1UnderworldSouth; // this.zork1Maze; // this.zork1OverworldWest;
  // ORDERED list of directions, most important first
  // TODO: get full list from game data service, allow user to specify ranking
  public allDirs: string[] = [
    "NORTH", "SOUTH", "EAST", "WEST", "NW", "NE", "SW", "SE", "UP", "DOWN", "IN", "OUT", "LAUNCH", "LAND",
  ];

  public touchedRoomIds: any;
  public xForce: any;
  public yForce: any;
  public exitDirectionStrength = 1.0;
  public manyBodyForce: any;
  public manyBodyForceStrength = -1;
  public linkForce: any;
  public linkForceStrength = 1.0;
  public simulation: any;
  public roomGroups: any;
  public lines: any;
  public mouseDownState: any; // {screenPos{x,y}, roomPos(x,y)}

  constructor(
    private route: ActivatedRoute,
    private gameDataService: GameDataService,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef
  ) {
    this.gameId = this.route.snapshot.params["gameId"];
  }

  ngOnInit(): void {
    this.gameDataService.getAllGameData(this.gameId, this);
  }

  public receiveGameData(gameData: any) {
    this.gameData = gameData;
    let customRoomCsvRows = [
      // "FOYER,Foyer",
      // "HALL,Hall",
      // "LIBRARY,Library",
      "WELH,West End Long Hall",
      "MTYLP,MTYLP",
      "MLTYP,MLTYP",
      "TGLMP,TGLMP",
      "MTGLP,MTGLP",
      "MLTGP,MLTGP",
      "TYLMP,TYLMP",
      "TYMLP,TYMLP",
      "LTYMP,LTYMP",
    ];
    let customConnectionsCsvRows = [
      // west end long hall
      "WELH,SOUTH,MTYLP",

      // maze of twisty little passages, all different
      "MTYLP,NORTH,MLTYP",
      "MTYLP,SOUTH,MTGLP",
      "MTYLP,EAST,LTYMP",
      "MTYLP,WEST,MLTGP",
      "MTYLP,UP,TYLMP",
      "MTYLP,DOWN,WELH",

      // maze of little twisty passages, all different
      "MLTYP,NORTH,TGLMP",
      "MLTYP,SOUTH,MLTGP",
      "MTYLP,EAST,LMTYP",
      "MLTYP,WEST,TGMLP",
      "MLTYP,UP,LTYMP",
      "MLTYP,DOWN,TYLMP",

      // maze of twisting little passages, all different
      "MTGLP,NORTH,MLTGP",
      "MTGLP,SOUTH,MLTYP",
      "MTGLP,EAST,LMTGP",
      "MTGLP,WEST,MTYLP",
      "MTGLP,UP,TYMLP",
      "MTGLP,DOWN,LTYMP",

      // little twisty maze of passages, all different
      "LTYMP,NORTH,",
      "LTYMP,SOUTH,",
      "LTYMP,EAST,",
      "LTYMP,WEST,",
      "LTYMP,UP,",
      "LTYMP,DOWN,",


      //"TGLMP,NORTH,MTGLP",
      //"MLTGP,NORTH,TYLMP",
      //"TYLMP,NORTH,MTYLP",
      //"MLTGP,SOUTH,TYMLP",
      //"TYMLP,SOUTH,TYLMP",

      //"LMTGP,SOUTH,DEADEND",
      //"DEADEND,NORTH,LMTGP",
      // There is a massive and somewhat battered vending machine here.
      // The instructions on it read: "Drop coins here to receive fresh batteries.
    ];
    this.gameData = {
      "Directions": ["NORTH", "SOUTH", "EAST", "WEST", "NW", "NE", "SW", "SE", "UP", "DOWN"],
      "Objects": []
    };
    this.gameData.Objects = customRoomCsvRows.map(row => {
      let [id, name] = row.split(",");
      return {
        "IsRoom": true,
        "Name": id,
        "Properties": {
          "DESC": [name]
        },
        "Exits": {}
      };
    });

    for (let row of customConnectionsCsvRows) {
      let [source, dir, dest] = row.split(",");
      let roomObj = this.gameData.Objects.find(o => o.Name == source);
      if (roomObj) {
        if (!roomObj.Exits[dir]) {
          roomObj.Exits[dir] = {"TO": dest};
        }
      }
    }
    /*

    this.gameData = {
      "Directions": ["NORTH", "SOUTH", "EAST", "WEST", "NW", "NE", "SW", "SE", "UP", "DOWN"],
      "Objects": [
        {
          "IsRoom": true,
          "Name": "FOYER",
          "Properties": {
            "DESC": ["Foyer"]
          },
          "Exits": {
            "NORTH": {"TO": "HALL"}
          },
        },
        {
          "IsRoom": true,
          "Name": "HALL",
          "Properties": {
            "DESC": ["Hall"]
          },
          "Exits": {
            "NORTH": {"TO": "LIBRARY"}
          },
        },
        {
          "IsRoom": true,
          "Name": "LIBRARY",
          "Properties": {
            "DESC": ["Library"]
          },
          "Exits": {
            "SOUTH": {"TO": "HALL"}
          },
        },
      ],
    };
    */
    this.allRooms = this.gameData.Objects.filter(o => o.IsRoom);
    this.roomsInMap = this.allRooms.map(r => r.Name);

    console.log("allRooms:", JSON.stringify(this.allRooms, null, 2));

    this.allNodes = [];
    this.nodeMap = {};
    this.touchedRoomIds = {};
    this.allLinks = [];
    this.linkMap = {}; // "roomId1:roomId2" => LinkData
    this.hasProcessedRoomToRoom = {};

    this.createConnectionMap();

    this.firstRoomId = this.roomsInMap[0];
    console.log("firstRoomId=" + this.firstRoomId);
    for (let roomId of this.roomsInMap) {
      this.addNewRoomToMap(roomId);
    }
    
    console.log("allNodes:", this.allNodes);
    console.log("allLinks:", this.allLinks);
    this.isInitialized = true;
    setTimeout(() => {
      this.drawMap();
    }, 250);

  }

  private createConnectionMap() {
    this.connectionMap = {};
    for (let roomObj of this.allRooms) {
      let roomId = roomObj.Name;
      if (roomObj) {
        for (let exitDir of this.allDirs) {
          let exit = roomObj.Exits[exitDir];
          if (exit && exit.TO) {
            let childRoomId = exit.TO;
            let connectionMapEntry: ConnectionMapEntry = this.getOrCreateConnectionMapEntry(roomId, childRoomId);
            let connection: RoomConnection = connectionMapEntry.connection;
            connection.addDirection(roomId, childRoomId, exitDir);
          }
        }
      } else {
        console.log("WARN: roomObj not found for: " + roomId);
      }
    }
    console.log("Finished creating connectionData:", this.connectionMap);
  }

  private getOrCreateConnectionMapEntry(roomId1: string, roomId2: string): ConnectionMapEntry {
    let roomA = roomId1 < roomId2 ? roomId1 : roomId2;
    let roomB = roomId1 < roomId2 ? roomId2 : roomId1;
    let key = roomA + ":" + roomB;
    let connectionMapEntry: ConnectionMapEntry = this.connectionMap[key];
    if (!connectionMapEntry) {
      connectionMapEntry = {
        "connection": new RoomConnection(key, roomA, roomB),
        "inMap": false
      };
      this.connectionMap[key] = connectionMapEntry;
    }
    return connectionMapEntry;
  }

  private getConnectionEntriesNotInMapForRoom(roomId: string) {
    let entriesNotInMap: ConnectionMapEntry[] = [];
    for (let key in this.connectionMap) {
      let entry: ConnectionMapEntry = this.connectionMap[key];
      let connection = entry.connection;
      if (roomId == connection.roomA || roomId == connection.roomB) {
        if (!entry.inMap) {
          entriesNotInMap.push(entry);
        }
      }
    }
    return entriesNotInMap;
  }

  private addNewRoomToMap(roomId: string) {
    if (this.nodeMap[roomId]) {
      console.log("WARN: Tried to add room " + roomId + " to map when it's already there!");
      return;
    }
    // Step 1: Add "room node"
    let roomObj = this.getRoomObjectFromGameData(roomId);
    console.log("Tried to get room object for roomId=" + roomId + ", got: " + roomObj);
    let roomNode = {
      "type": "room",
      "id": roomObj.Name,
      "name": roomObj.Properties["DESC"][0],
      "x": this.MAP_CENTER_X,
      "y": this.MAP_CENTER_Y,
      "width": this.ROOM_WIDTH,
      "height": this.ROOM_HEIGHT,
      "vx": 0,
      "vy": 0,
      "votes": 0,
      "relVotes": []
    };
    this.allNodes.push(roomNode);
    this.nodeMap[roomId] = roomNode;

    // Step 2: Add all connections (to/from this room) to the map
    let entries = this.getConnectionEntriesNotInMapForRoom(roomId);
    for (let entry of entries) {
      let connection = entry.connection;
      let nodeA = this.nodeMap[connection.roomA];
      let nodeB = this.nodeMap[connection.roomB];
      if (nodeA && nodeB) {
        let mainDirA = connection.getPreferredDirection(nodeA.id);
        let mainDirB = connection.getPreferredDirection(nodeB.id);
        let labelExitA = connection.getLabelA(); /// canGoA2B() ? mainDirA : "x"; // TODO: show more than just the main direction
        let labelExitB = connection.getLabelB(); /// canGoB2A() ? mainDirB : "x"; // TODO: show more than just the main direction
        let deltaA = this.DELTAS[mainDirA];
        let deltaB = this.DELTAS[mainDirB];
        if (!deltaA) {
          console.log("Could not find delta for: " + mainDirA);
        }
        if (!deltaB) {
          console.log("Could not find delta for: " + mainDirB);
        }
        let aIsNew: boolean = (nodeA.id == roomId ? true : false);
        let roomExitNodeA = {
          "type": "exit",
          "id": nodeA.id + ">" + nodeB.id,
          "roomId": nodeA.id,
          "name": labelExitA,
          "label": labelExitA,
          "x": nodeA.x + deltaA.x,
          "y": nodeA.y + deltaA.y,
          "width": this.EXIT_NODE_SIZE,
          "height": this.EXIT_NODE_SIZE,
          "deltaX": deltaA.x,
          "deltaY": deltaA.y,
          "vx": 0,
          "vy": 0,
          //"votes": 0,
          //"relVotes": []
        };
        let linkRoomAToExitA = {
            "source": nodeA,
            "target": roomExitNodeA,
            "id": nodeA.id + ":" + roomExitNodeA.id,
            "type": "roomToExit",
            "distance": this.ROOM_EXIT_PROTRUSION_LENGTH,
            "strength": 0.0, // will be handled by exitForce, not linkForce
            "label": labelExitA
        };
        let roomExitNodeB = {
          "type": "exit",
          "id": nodeB.id + ">" + nodeA.id,
          "roomId": nodeB.id,
          "name": labelExitB,
          "label": labelExitB,
          "x": nodeB.x + deltaB.x,
          "y": nodeB.y + deltaB.y,
          "width": this.EXIT_NODE_SIZE,
          "height": this.EXIT_NODE_SIZE,
          "deltaX": deltaB.x,
          "deltaY": deltaB.y,
          "vx": 0,
          "vy": 0,
          //"votes": 0,
          //"relVotes": []
        };
        let linkRoomBToExitB = {
            "source": nodeB,
            "target": roomExitNodeB,
            "id": nodeB.id + ":" + roomExitNodeB.id,
            "type": "roomToExit",
            "distance": this.ROOM_EXIT_PROTRUSION_LENGTH,
            "strength": 0.0, // will be handled by exitForce, not linkForce
            "label": labelExitB
        };
        let linkExitAToExitB = {
          "source": roomExitNodeA,
          "target": roomExitNodeB,
          "id": roomExitNodeA.id + ":" + roomExitNodeB.id,
          "type": "exitToExit",
          "distance": this.MIN_INTER_LINK_DISTANCE, // this.MIN_INTER_ROOM_DISTANCE, // TODO: should be less
          "strength": 0.0,
          "label": connection.id
        };
        let ratio = 1.0;
        if (aIsNew) {
          let deltaX = deltaB.x - deltaA.x;
          let deltaY = deltaB.y - deltaA.y;
          let deltaMag = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          if (deltaMag <= 0.1) {
            deltaMag = 0.1;
          }
          console.log("deltaMag=" + deltaMag);
          ratio = this.MIN_INTER_ROOM_DISTANCE / deltaMag;
          let roomPosX = nodeB.x + ratio * deltaX;
          let roomPosY = nodeB.y + ratio * deltaY;
          roomExitNodeA.x = roomPosX + deltaA.x;
          roomExitNodeA.y = roomPosY + deltaA.y;
        } else {
          let deltaX = deltaA.x - deltaB.x;
          let deltaY = deltaA.y - deltaB.y;
          let deltaMag = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          if (deltaMag <= 0.1) {
            deltaMag = 0.1;
          }
          console.log("deltaMag=" + deltaMag);
          ratio = this.MIN_INTER_ROOM_DISTANCE / deltaMag;
          let roomPosX = nodeA.x + ratio * deltaX;
          let roomPosY = nodeA.y + ratio * deltaY;
          roomExitNodeB.x = roomPosX + deltaB.x;
          roomExitNodeB.y = roomPosY + deltaB.y;
        }
        this.allNodes.push(roomExitNodeA); this.nodeMap[roomExitNodeA.id] = roomExitNodeA;
        this.allNodes.push(roomExitNodeB); this.nodeMap[roomExitNodeB.id] = roomExitNodeB;
        this.allLinks.push(linkRoomAToExitA); this.linkMap[linkRoomAToExitA.id] = linkRoomAToExitA;
        this.allLinks.push(linkRoomBToExitB); this.linkMap[linkRoomBToExitB.id] = linkRoomBToExitB;
        this.allLinks.push(linkExitAToExitB); this.linkMap[linkExitAToExitB.id] = linkExitAToExitB;
        entry.inMap = true;
      } else {
        //console.log("Not adding connection because one of the rooms is not in the map:", entry);
      }
    }

    // Step 3: position the new node based on its outgoing exit nodes
    this.repositionNodeBasedOnExitNodes(roomNode);
  }

  public drawMap() {

      var container = d3.select(".map-container");

      var gridlinesData: any[] = [];
      for (let i=0; i<1000; i+=50) {
        gridlinesData.push({x1: i, y1: 0, x2: i,    y2: 1000});
        gridlinesData.push({x1: 0, y1: i, x2: 1000, y2:    i});
      }
      var gridlines = container
      .selectAll("g.gridlines")
      .data(gridlinesData)
      .enter()
      .append("line")
        .attr("x1", d => d.x1)
        .attr("y1", d => d.y1)
        .attr("x2", d => d.x2)
        .attr("y2", d => d.y2)
        .attr("stroke", "rgba(128,128,128,0.2)")
        .attr("stroke-width", "2")
      ;

      var lineGroups = container
      .selectAll("g.link")
      .data(this.allLinks)
      .enter()
      .append("g")
        .attr("class", "link")
      ;
      this.lines = lineGroups
        .append("line")
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y)
          .attr("stroke", "var(--green-200)")
          .attr("stroke-width", "12")
      ;
      /*
      lines
        .append("text")
        .attr("transform", (d) => {
          return "translate(0,8)";
        })
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "8pt")
        .html((d)=>{return d.id;})
      ;
      */

      this.roomGroups = container
        .selectAll("g.room")
        .data(this.allNodes)
        .enter()
        .append("g")
          .attr("class", "room")
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      ;
      var rectangles = this.roomGroups
        .append("rect")
          .attr("x", function(d) { return -d.width/2; })
          .attr("y", function(d) { return -d.height/2 })
          .attr("rx", 15)
          .attr("width", function(d) { return d.width; })
          .attr("height", function(d) { return d.height; })
          .attr("stroke", "var(--grey-100)")
          .attr("stroke-width", "0")
          .attr("fill", "var(--green-200)")
          .attr("r", 25)
      ;
      this.roomGroups
        .append("text")
          .attr("transform", (d)=>{
            if (d.type=="room") {
              return "translate(0,-8)";
            } else if (d.type=="exit") {
              // TODO: smarter
              let x = -d.deltaX * 0.40;
              let y = -d.deltaY * 0.40;
              return "translate(" + x + "," + y + ")";
            } else {
              return "translate(0,0)";
            }
          })
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .attr("fill", "var(--green-700)")
          .attr("font-size", "10pt")
          .attr("font-weight", "bold")
          .html((d)=>{
            if (d.type=="room") {
              return d.name;
            } else if (d.type=="exit") {
              ////return d.name.toLowerCase();
              return d.label;
            }
          })
      ;
      this.roomGroups
        .append("text")
          .attr("transform", (d)=>{
            //if (d.type=="room") {
              return "translate(0,8)";
            //} else {
            //  return "translate(0,0)";
            //}
          })
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .attr("fill", "var(--grey-600)")
          .attr("font-size", "8pt")
          .html((d)=>{
            if (d.type=="room") {
              return d.id;
            } else if (d.type=="exit") {
              return ""; // TODO: avoid creating this text altogether
            }
          })
      ;


      var onTickFunction = () => {
        this.roomGroups
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        ;
        this.lines
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y)
        ;
      };

      this.xForce = d3.forceX();
      this.yForce = d3.forceY();
      this.manyBodyForce = d3.forceManyBody();
      this.manyBodyForce.strength(this.manyBodyForceStrength);
      this.linkForce = d3
        .forceLink(this.allLinks)
        .distance((d)=>{return d.distance;})
        .strength((d)=>{return d.strength;})
      ;

      var exitForce = this.exitForce.bind(this);
      exitForce["foo"] = "bar";
      exitForce["initialize"] = function(nodes, random) {
        console.log("exitForce.initialize(), nodes:", nodes, "random:", random);
      }

      this.simulation = d3.forceSimulation(this.allNodes)
        .force("charge", this.manyBodyForce)             // force on all nodes at the same time, like gravity, or repel (default)
        .force("center", d3.forceCenter(this.MAP_CENTER_X, this.MAP_CENTER_Y).strength(2))
        .force("link", this.linkForce)    // force that tries to achieve a desired link distance
        //////.force("exitForce", exitForce)
        .force("collision", d3.forceCollide(50))
        .on("tick", this.onTickFunction.bind(this))
        .alphaDecay(0)
        .stop()
      ;

      for (let i=0; i<50; i++) {
        this.simulation.tick();
        onTickFunction();
      }

      this.simulation["component"] = this;
      console.log("simulation:", this.simulation);
      // TODO: try this.roomGroups instead below
      rectangles.call(
      ////this.roomGroups.call(
          d3
          .drag()
          ////.subject(this.dragSubjectFilter.bind(this))
          .on("start", this.onDragStart.bind(this))
          .on("drag", this.onDragged.bind(this))
          .on("end", this.onDragEnd.bind(this))
          ////.filter(event => !viewof lock.value || event.shiftKey)
        // .touchable(false)
      );

      ////this.simulation.restart();
  }

  public onTickFunction() {
    this.lines
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
    ;
    this.roomGroups
      .attr("transform", function(d) {
        if (d.id == "NORTH-OF-HOUSE") {
          console.log("upd xlate to: " + d.x.toFixed(1) + ", " + d.y.toFixed(1));
        }
        return "translate(" + d.x + "," + d.y + ")";
      })
    ;
  };

  private dragSubjectFilter(event) {
    let radius = 3;
    console.log("dragSubjectFilter, this:", this, "event:", event);
    return true;
    //const subject = this["simulation"].find(event.x, event.y, radius);
    //return subject.type === "black" ? subject : null;
  }

  private moveRoomNodeAndExitNodes(roomId, x, y, isFixed: boolean) {
    let roomNode = this.getRoomNode(roomId);
    let dx = x - roomNode.x;
    let dy = y - roomNode.y;
    roomNode.x = x;
    roomNode.y = y;
    if (isFixed) {
      roomNode.fx = roomNode.x;
      roomNode.fy = roomNode.y;
    }
    let exitNodes = this.getExitNodes(roomId);
    for (let node of exitNodes) {
      node.x += dx;
      node.y += dy;
      if (isFixed) {
        node.fx = node.x;
        node.fy = node.y;
      }
    }
  }

  private onDragStart(event) {
    console.log("onDragStart, event:", event);
    this.mouseDownState = {
      screenPos: {
        x: event.sourceEvent.screenX,
        y: event.sourceEvent.screenY
      },
      roomPos: {
        x: event.subject.x,
        y: event.subject.y
      }
    };
    ////if (!event.active) this["simulation"].alphaTarget(0.3).restart();
    let roomId = event.subject.id;
    this.moveRoomNodeAndExitNodes(roomId, event.x, event.y, true);
    ////this.simulation.stop();
  }

  private onDragged(event) {
    console.log("onDragged, event:", event);
    let currentState = {
      screenPos: {
        x: event.sourceEvent.screenX,
        y: event.sourceEvent.screenY
      },
      roomPos: {
        x: event.subject.x, // seems to be incorrect; gets confused when updating node data while dragging
        y: event.subject.y  // seems to be incorrect; gets confused when updating node data while dragging
      }
    };
    let dx = currentState.screenPos.x - this.mouseDownState.screenPos.x;
    let dy = currentState.screenPos.y - this.mouseDownState.screenPos.y;
    // TODO: account for scaling when scale is not 1:1
    let newRoomX = this.mouseDownState.roomPos.x + dx;
    let newRoomY = this.mouseDownState.roomPos.y + dy;
    let roomId = event.subject.id;
    this.moveRoomNodeAndExitNodes(roomId, newRoomX, newRoomY, true);
    this.onTickFunction();
  }

  private onDragEnd(event) {
    console.log("onDragEnd event:", event);
    ////if (!event.active) this["simulation"].alphaTarget(0);
    //let roomId = event.subject.id;
    //this.moveRoomNodeAndExitNodes(roomId, event.x, event.y, false);
    ////this.simulation.restart();
    ////this.onTickFunction();
  }

  private eventToString(e) {
    let round = ((i) => i.toFixed(1));
    let n = e.subject;
    let s = "e: " +
      //"type=" + e.type + ", active=" + e.active + ", " +
      " x = " + round(n.x) + " + " + round(e.dx) + " = " + round(e.x) + " |" +
      " y = " + round(n.y) + " + " + round(e.dy) + " = " + round(e.y);
    return s;
  }

  // reposition a node and its exit nodes based on its current exit node positions
  public repositionNodeBasedOnExitNodes(node) {
    console.log("REPO called");
    let links = this.getRoomToExitLinks(node.id);
    if (links.length > 0) {
      let exitNodes = links.map(link => link.target);
      if (exitNodes.length > 0) {
        let sumX = exitNodes.map(exitNode => exitNode.x - exitNode.deltaX).reduce((sum, x) => sum + x);
        let sumY = exitNodes.map(exitNode => exitNode.y - exitNode.deltaY).reduce((sum, y) => sum + y);
        let avgX = sumX / exitNodes.length;
        let avgY = sumY / exitNodes.length;
        // let deltaX = node.x - avgX;
        // let deltaY = node.y - avgY;
        node.x = avgX;
        node.y = avgY;
        // now re-adjust exit nodes
        for (let exitNode of exitNodes) {
          ////console.log("exitNode.y="+exitNode.y+ ", node.x=" + node.x + ", exitNode.deltaY="+exitNode.deltaY);
          exitNode.x = node.x + exitNode.deltaX;
          exitNode.y = node.y + exitNode.deltaY;
          ////console.log("exitNode.y="+exitNode.y + " after adj");
        }
      }
    }
  }

  public exitForce(alpha) {
    console.log("EXIT FORCE");
    //let k = alpha * 0.1;
    for (let node of this.allNodes) {
      this.repositionNodeBasedOnExitNodes(node);
    }
  }

  private getRoomToExitLinks(nodeId: string): any[] {
    let roomToExitLinks: any[] = [];
    for (let link of this.allLinks) {
      if (link.type == "roomToExit" && link.source.id == nodeId) {
        roomToExitLinks.push(link);
      }        
    }
    return roomToExitLinks;
  }

  public getRoomObjectFromGameData(roomId: string) {
    for (let r of this.allRooms) {
      if (r.Name == roomId) {
        return r;
      }      
    }
    return null;
  }

  public getRoomNode(roomId: string) {
    // TODO: optimize by using object/map instead of array
    for (let n of this.allNodes) {
      if (n.id == roomId) {
        return n;
      }      
    }
    return null;
  }

  public getExitNodes(roomId: string): any[] {
    let exitNodes: any[] = [];
    for (let n of this.allNodes) {
      if (n.roomId == roomId) {
        exitNodes.push(n);
      }      
    }
    return exitNodes;
  }

  public getRoomCardText(r) {
    if (r.Properties.FDESC) { return r.Properties.FDESC; }
    if (r.Properties.LDESC) { return r.Properties.LDESC; }
    if (r.Properties.ACTION && r.Properties.ACTION[0] && r.Properties.ACTION[0].A) {
      return "(described by " + r.Properties.ACTION[0].A + ")";
    }
    console.log("WARN: Could not find room description or ACTION for:", r);
    return "";
  }

  public passesFilters(o) {
    return true;
  }

  public applyChanges() {
    this.manyBodyForce.strength(this.manyBodyForceStrength);
  }

}
