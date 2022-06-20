import { sha256 } from "@cosmjs/crypto"
import { toHex } from "@cosmjs/encoding"
import { writeFile } from "fs/promises"
import { Server } from "http"
import * as express from "express"; 
import { Express, Request, Response } from "express"
import { IndexerStargateClient } from "./indexer_stargateclient"
import { config } from "dotenv"
import { DbType, GameInfo, PlayerInfo } from "./types"
import { Block, IndexedTx } from "@cosmjs/stargate";
import { ABCIMessageLog, StringEvent, Attribute} from "cosmjs-types/cosmos/base/abci/v1beta1/abci"
import { StoredGame } from "src/types/generated/checkers/stored_game";


config()

export const createIndexer = async () => {
    const port = "3001"
    const dbFile = `${__dirname}/db.json`
    const db: DbType = require(dbFile)
    const pollIntervalMs = 5_000 // 5 seconds
    let timer: NodeJS.Timer | undefined
    let client: IndexerStargateClient


    const app: Express = express()
    app.get("/", (req: Request, res: Response) => {
        res.send({
            error: "Not implemented",
        })
    })

    app.get("/status", (req: Request, res: Response) => {
        res.json({
            block: {
                height: db.status.block.height,
            },
        })
    })

    app.get("/players/:playerAddress", (req: Request, res: Response) => {
        res.json({
            gameCount: db.players[req.params.playerAddress]?.gameIds?.length ?? 0,
            gameIds: db.players[req.params.playerAddress]?.gameIds ?? [],
        })
    })

    app.get("/players/:playerAddress/gameIds", (req: Request, res: Response) => {
        res.json(db.players[req.params.playerAddress]?.gameIds ?? [])
    })

    app.patch("/games/:gameId", async (req: Request, res: Response) => {
        const found = await patchGame(req.params.gameId)
        if (!found) res.status(404)
        else {
            res.json({
                result: "Thank you",
            })
        }
    })

    const saveDb = async () => {
        await writeFile(dbFile, JSON.stringify(db, null, 4))
    }

    const init = async () => {
        client = await IndexerStargateClient.connect(process.env.RPC_URL!)
        console.log("Connected to chain-id:", await client.getChainId())
        setTimeout(poll, 1)
    }

    const poll = async () => {
        const currentHeight = await client.getHeight()
        if (db.status.block.height <= currentHeight - 100)
            console.log(`Catching up ${db.status.block.height}..${currentHeight}`)
        while (db.status.block.height < currentHeight) {
            const processing = db.status.block.height + 1
            process.stdout.cursorTo(0)
            // Get the block
            const block: Block = await client.getBlock(processing)
            process.stdout.write(`Handling block: ${processing} with ${block.txs.length} txs`)
            await handleBlock(block)
            db.status.block.height = processing
        }
        await saveDb()
        timer = setTimeout(poll, pollIntervalMs)
    }

    const handleBlock = async (block: Block) => {
        if (0 < block.txs.length) console.log("")
        let txIndex = 0
        while (txIndex < block.txs.length) {
            const txHash: string = toHex(sha256(block.txs[txIndex])).toUpperCase()
            const indexed: IndexedTx | null = await client.getTx(txHash)
            if (!indexed) throw new Error(`Could not find indexed tx: ${txHash}`)
            await handleTx(indexed)
            txIndex++
        }
        const events: StringEvent[] = await client.getEndBlockEvents(block.header.height)
        if (0 < events.length) console.log("")
        await handleEvents(events)
    }
    
    const handleTx = async (indexed: IndexedTx) => {
        const rawLog: any = JSON.parse(indexed.rawLog)
        const events: StringEvent[] = rawLog.flatMap((log: ABCIMessageLog) => log.events)
        await handleEvents(events)
    }

    const handleEvents = async (events: StringEvent[]): Promise<void> => {
        try {
            const myEvents: StringEvent[] = events
                .filter((event: StringEvent) => event.type === "message")
                .filter((event: StringEvent) =>
                    event.attributes.some(
                        (attribute: Attribute) =>
                            attribute.key === "module" && attribute.value === "checkers",
                    ),
                )
            let eventIndex = 0
            while (eventIndex < myEvents.length) {
                await handleEvent(myEvents[eventIndex])
                eventIndex++
            }
        } catch (e) {
            // Skipping if the handling failed. Most likely the transaction failed.
        }
    }

    const handleEvent = async (event: StringEvent): Promise<void> => {
        const isActionOf = (actionValue: string): boolean =>
            event.attributes.some(
                (attribute: Attribute) => attribute.key === "action" && attribute.value === actionValue,
            )
        if (isActionOf("NewGameCreated")) {
            // Function yet to be declared
            await handleEventCreate(event)
        }
        if (isActionOf("GameRejected")) {
            // Function yet to be declared
            await handleEventReject(event)
        }
        if (isActionOf("MovePlayed")) {
            // Function yet to be declared
            await handleEventPlay(event)
        }
        if (isActionOf("GameForfeited")) {
            await handleEventForfeit(event)
        }
    }

    const handleEventCreate = async (event: StringEvent): Promise<void> => {
        const newId: string | undefined = getAttributeValueByKey(event.attributes, "Index")
        if (!newId) throw new Error(`Create event missing Index`)
        const blackAddress: string | undefined = getAttributeValueByKey(event.attributes, "Black")
        if (!blackAddress) throw new Error(`Create event missing Black address`)
        const redAddress: string | undefined = getAttributeValueByKey(event.attributes, "Red")
        if (!redAddress) throw new Error(`Create event missing Red address`)
        console.log(`New game: ${newId}, black: ${blackAddress}, red: ${redAddress}`)
        const blackInfo: PlayerInfo = db.players[blackAddress] ?? {
            gameIds: [],
        }
        const redInfo: PlayerInfo = db.players[redAddress] ?? {
            gameIds: [],
        }
        if (blackInfo.gameIds.indexOf(newId) < 0) blackInfo.gameIds.push(newId)
        if (redInfo.gameIds.indexOf(newId) < 0) redInfo.gameIds.push(newId)
        db.players[blackAddress] = blackInfo
        db.players[redAddress] = redInfo
        db.games[newId] = {
            redAddress: redAddress,
            blackAddress: blackAddress,
        }
    }

    const handleEventReject = async (event: StringEvent): Promise<void> => {
        const rejectedId: string | undefined = getAttributeValueByKey(event.attributes, "IdValue")
        if (!rejectedId) throw new Error(`Reject event missing rejectedId`)
        const blackAddress: string | undefined = db.games[rejectedId]?.blackAddress
        const redAddress: string | undefined = db.games[rejectedId]?.redAddress
        const blackGames: string[] = db.players[blackAddress]?.gameIds ?? []
        const redGames: string[] = db.players[redAddress]?.gameIds ?? []
        console.log(`Reject game: ${rejectedId}, black: ${blackAddress}, red: ${redAddress}`)
        const indexInBlack: number = blackGames.indexOf(rejectedId)
        if (0 <= indexInBlack) blackGames.splice(indexInBlack, 1)
        const indexInRed: number = redGames.indexOf(rejectedId)
        if (0 <= indexInRed) redGames.splice(indexInRed, 1)
    }

    const handleEventPlay = async (event: StringEvent): Promise<void> => {
        const playedId: string | undefined = getAttributeValueByKey(event.attributes, "IdValue")
        if (!playedId) throw new Error(`Play event missing rejectedId`)
        const winner: string | undefined = getAttributeValueByKey(event.attributes, "Winner")
        if (!winner) throw new Error("Play event missing winner")
        if (winner === "NO_PLAYER") return
        const blackAddress: string | undefined = db.games[playedId]?.blackAddress
        const redAddress: string | undefined = db.games[playedId]?.redAddress
        const blackGames: string[] = db.players[blackAddress]?.gameIds ?? []
        const redGames: string[] = db.players[redAddress]?.gameIds ?? []
        console.log(`Win game: ${playedId}, black: ${blackAddress}, red: ${redAddress}, winner: ${winner}`)
        const indexInBlack: number = blackGames.indexOf(playedId)
        if (0 <= indexInBlack) blackGames.splice(indexInBlack, 1)
        const indexInRed: number = redGames.indexOf(playedId)
        if (0 <= indexInRed) redGames.splice(indexInRed, 1)
    }

    const handleEventForfeit = async (event: StringEvent): Promise<void> => {
        const forfeitedId: string | undefined = getAttributeValueByKey(event.attributes, "IdValue")
        if (!forfeitedId) throw new Error(`Forfeit event missing forfeitedId`)
        const winner: string | undefined = getAttributeValueByKey(event.attributes, "Winner")
        const blackAddress: string | undefined = db.games[forfeitedId]?.blackAddress
        const redAddress: string | undefined = db.games[forfeitedId]?.redAddress
        const blackGames: string[] = db.players[blackAddress]?.gameIds ?? []
        const redGames: string[] = db.players[redAddress]?.gameIds ?? []
        console.log(
            `Forfeit game: ${forfeitedId}, black: ${blackAddress}, red: ${redAddress}, winner: ${winner}`,
        )
        const indexInBlack: number = blackGames.indexOf(forfeitedId)
        if (0 <= indexInBlack) blackGames.splice(indexInBlack, 1)
        const indexInRed: number = redGames.indexOf(forfeitedId)
        if (0 <= indexInRed) redGames.splice(indexInRed, 1)
        if (winner === "NO_PLAYER") {
            delete db.games[forfeitedId]
        }
    }

    const getAttributeValueByKey = (attributes: Attribute[], key: string): string | undefined => {
        return attributes.find((attribute: Attribute) => attribute.key === key)?.value
    }

    const patchGame = async (gameId: string): Promise<boolean> => {
        const game: StoredGame | undefined = await client.checkersQueryClient?.checkers.getStoredGame(gameId)
        const cachedGame: GameInfo | undefined = db.games[gameId]
        if (!game && cachedGame) {
            const blackGames: string[] = db.players[cachedGame.blackAddress]?.gameIds ?? []
            const redGames: string[] = db.players[cachedGame.redAddress]?.gameIds ?? []
            console.log(
                `Patch game: deleted, ${gameId}, black: ${cachedGame.blackAddress}, red: ${cachedGame.redAddress}`,
            )
            const indexInBlack: number = blackGames.indexOf(gameId)
            if (0 <= indexInBlack) blackGames.splice(indexInBlack, 1)
            const indexInRed: number = redGames.indexOf(gameId)
            if (0 <= indexInRed) redGames.splice(indexInRed, 1)
            return true
        } else if (!game) {
            // No information to work from.
            // If we try to remove it from all players, it is very expensive and we are at risk of a DoS attack.
            console.log(`Patch game: not found, ${gameId}`)
            return false
        } else if (game.winner !== "NO_PLAYER") {
            const blackGames: string[] = db.players[game.black]?.gameIds ?? []
            const redGames: string[] = db.players[game.red]?.gameIds ?? []
            console.log(
                `Patch game: ended, ${gameId}, black: ${game.black}, red: ${game.red}, winner: ${game.winner}`,
            )
            const indexInBlack: number = blackGames.indexOf(gameId)
            if (0 <= indexInBlack) blackGames.splice(indexInBlack, 1)
            const indexInRed: number = redGames.indexOf(gameId)
            if (0 <= indexInRed) redGames.splice(indexInRed, 1)
            return true
        } else {
            const blackInfo: PlayerInfo = db.players[game.black] ?? {
                gameIds: [],
            }
            const redInfo: PlayerInfo = db.players[game.red] ?? {
                gameIds: [],
            }
            console.log(
                `Patch game: new, ${gameId}, black: ${game.black}, red: ${game.red}, winner: ${game.winner}`,
            )
            if (blackInfo.gameIds.indexOf(gameId) < 0) blackInfo.gameIds.push(gameId)
            if (redInfo.gameIds.indexOf(gameId) < 0) redInfo.gameIds.push(gameId)
            db.players[game.black] = blackInfo
            db.players[game.red] = redInfo
            db.games[gameId] = {
                redAddress: game.red,
                blackAddress: game.black,
            }
            return true
        }
    }
    process.on("SIGINT", () => {
        if (timer) clearTimeout(timer)
        saveDb()
            .then(() => {
                console.log(`${dbFile} saved`)
            })
            .catch(console.error)
            .finally(() => {
                server.close(() => {
                    console.log("server closed")
                    process.exit(0)
                })
            })
    })

    const server: Server = app.listen(port, () => {
        init()
            .catch(console.error)
            .then(() => {
                console.log(`\nserver started at http://localhost:${port}`)
            })
    })
}