import asyncio
import websockets
from aiohttp import web

clients = {"host": None, "controller": None}

# WebSocket handler
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

# HTTP route for index.html
async def index(request):
    return web.FileResponse("index.html")

async def main():
    # Start WebSocket server
    ws_server = websockets.serve(handler, "0.0.0.0", 8000)

    # Start HTTP server
    app = web.Application()
    app.router.add_get("/", index)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", 8080)

    await asyncio.gather(ws_server, site.start(), asyncio.Future())

asyncio.run(main())
