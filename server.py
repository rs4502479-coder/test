import asyncio
import websockets

clients = {"host": None, "controller": None}

async def handler(ws, path):
    role = await ws.recv()
    clients[role] = ws
    print(f"{role} connected")

    try:
        async for msg in ws:
            if role == "host" and clients["controller"]:
                await clients["controller"].send(msg)
            elif role == "controller" and clients["host"]:
                await clients["host"].send(msg)
    except:
        pass
    finally:
        clients[role] = None

async def main():
    async with websockets.serve(handler, "0.0.0.0", 8000):
        await asyncio.Future()

asyncio.run(main())
