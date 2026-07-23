# import asyncio
# import websockets
# from aiohttp import web

# clients = {"host": None, "controller": None}

# # WebSocket handler
# async def handler(ws, path=None):
#     # Expect the client to send "host" or "controller" as its first message
#     try:
#         role = await ws.recv()
#         if role not in clients:
#             print(f"Unknown role received: {role}")
#             await ws.close(1008, "Invalid role")
#             return

#         clients[role] = ws
#         print(f"[{role}] connected")

#         async for msg in ws:
#             # Relay messages to the opposite client
#             target_role = "controller" if role == "host" else "host"
#             target_ws = clients[target_role]
            
#             if target_ws:
#                 await target_ws.send(msg)

#     except websockets.exceptions.ConnectionClosed:
#         pass
#     except Exception as e:
#         print(f"Error handling {role}: {e}")
#     finally:
#         if 'role' in locals() and clients.get(role) == ws:
#             clients[role] = None
#             print(f"[{role}] disconnected")

# # HTTP route for index.html
# async def index(request):
#     return web.FileResponse("index.html")

# async def main():
#     # 1. Start HTTP server
#     app = web.Application()
#     app.router.add_get("/", index)
#     runner = web.AppRunner(app)
#     await runner.setup()
#     site = web.TCPSite(runner, "0.0.0.0", 8080)
#     await site.start()

#     # 2. Start WebSocket server
#     async with websockets.serve(handler, "0.0.0.0", 8000):
#         print("Server running:")
#         print("  - Web App:   http://0.0.0.0:8080")
#         print("  - WebSocket: ws://0.0.0.0:8000")
        
#         # Keep the event loop running indefinitely
#         await asyncio.Future()

# if __name__ == "__main__":
#     try:
#         asyncio.run(main())
#     except KeyboardInterrupt:
#         print("\nServer shut down cleanly.")
