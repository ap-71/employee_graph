from fastapi_mcp import FastApiMCP
from api.routes import app as app


mcp = FastApiMCP(app, name="MCP Service")
mcp.mount()