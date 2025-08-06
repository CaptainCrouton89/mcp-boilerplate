# MCP Server Development Guide

## Overview

Build an MCP weather server with two tools: `get_alerts` and `get_forecast`. MCP servers provide:

1. **Resources**: File-like data
2. **Tools**: Functions callable by LLMs
3. **Prompts**: Pre-written templates

## Python Implementation

### Setup
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv init weather && cd weather
uv venv && source .venv/bin/activate
uv add "mcp[cli]" httpx
touch weather.py
```

### Code
```python
from typing import Any
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather")
NWS_API_BASE = "https://api.weather.gov"
USER_AGENT = "weather-app/1.0"

async def make_nws_request(url: str) -> dict[str, Any] | None:
    headers = {"User-Agent": USER_AGENT, "Accept": "application/geo+json"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except Exception:
            return None

def format_alert(feature: dict) -> str:
    props = feature["properties"]
    return f"""
Event: {props.get('event', 'Unknown')}
Area: {props.get('areaDesc', 'Unknown')}
Severity: {props.get('severity', 'Unknown')}
Description: {props.get('description', 'No description available')}
Instructions: {props.get('instruction', 'No specific instructions provided')}
"""

@mcp.tool()
async def get_alerts(state: str) -> str:
    """Get weather alerts for a US state.
    Args:
        state: Two-letter US state code (e.g. CA, NY)
    """
    url = f"{NWS_API_BASE}/alerts/active/area/{state}"
    data = await make_nws_request(url)

    if not data or "features" not in data:
        return "Unable to fetch alerts or no alerts found."

    if not data["features"]:
        return "No active alerts for this state."

    alerts = [format_alert(feature) for feature in data["features"]]
    return "\n---\n".join(alerts)

@mcp.tool()
async def get_forecast(latitude: float, longitude: float) -> str:
    """Get weather forecast for a location.
    Args:
        latitude: Latitude of the location
        longitude: Longitude of the location
    """
    points_url = f"{NWS_API_BASE}/points/{latitude},{longitude}"
    points_data = await make_nws_request(points_url)

    if not points_data:
        return "Unable to fetch forecast data for this location."

    forecast_url = points_data["properties"]["forecast"]
    forecast_data = await make_nws_request(forecast_url)

    if not forecast_data:
        return "Unable to fetch detailed forecast."

    periods = forecast_data["properties"]["periods"]
    forecasts = []
    for period in periods[:5]:
        forecast = f"""
{period['name']}:
Temperature: {period['temperature']}°{period['temperatureUnit']}
Wind: {period['windSpeed']} {period['windDirection']}
Forecast: {period['detailedForecast']}
"""
        forecasts.append(forecast)

    return "\n---\n".join(forecasts)

if __name__ == "__main__":
    mcp.run(transport='stdio')
```

Run: `uv run weather.py`

## TypeScript Implementation

### Setup
```bash
mkdir weather && cd weather
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D @types/node typescript
mkdir src && touch src/index.ts
```

### package.json
```json
{
  "type": "module",
  "bin": {"weather": "./build/index.js"},
  "scripts": {"build": "tsc && chmod 755 build/index.js"},
  "files": ["build"]
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "Node16", "moduleResolution": "Node16",
    "outDir": "./build", "rootDir": "./src", "strict": true,
    "esModuleInterop": true, "skipLibCheck": true
  },
  "include": ["src/**/*"], "exclude": ["node_modules"]
}
```

### Code (src/index.ts)
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

const server = new McpServer({
  name: "weather",
  version: "1.0.0",
  capabilities: { resources: {}, tools: {} }
});

async function makeNWSRequest<T>(url: string): Promise<T | null> {
  const headers = {"User-Agent": USER_AGENT, Accept: "application/geo+json"};
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

interface AlertFeature {
  properties: {
    event?: string; areaDesc?: string; severity?: string;
    status?: string; headline?: string;
  };
}

function formatAlert(feature: AlertFeature): string {
  const props = feature.properties;
  return [
    `Event: ${props.event || "Unknown"}`,
    `Area: ${props.areaDesc || "Unknown"}`,
    `Severity: ${props.severity || "Unknown"}`,
    `Status: ${props.status || "Unknown"}`,
    `Headline: ${props.headline || "No headline"}`,
    "---"
  ].join("\n");
}

server.tool(
  "get_alerts",
  "Get weather alerts for a state",
  { state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)") },
  async ({ state }) => {
    const stateCode = state.toUpperCase();
    const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
    const alertsData = await makeNWSRequest<{features: AlertFeature[]}>(alertsUrl);

    if (!alertsData) {
      return { content: [{ type: "text", text: "Failed to retrieve alerts data" }] };
    }

    const features = alertsData.features || [];
    if (features.length === 0) {
      return { content: [{ type: "text", text: `No active alerts for ${stateCode}` }] };
    }

    const formattedAlerts = features.map(formatAlert);
    const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;

    return { content: [{ type: "text", text: alertsText }] };
  }
);

server.tool(
  "get_forecast",
  "Get weather forecast for a location",
  {
    latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
    longitude: z.number().min(-180).max(180).describe("Longitude of the location")
  },
  async ({ latitude, longitude }) => {
    const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointsData = await makeNWSRequest<{properties: {forecast?: string}}>(pointsUrl);

    if (!pointsData) {
      return { content: [{ type: "text", text: "Failed to retrieve grid point data" }] };
    }

    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) {
      return { content: [{ type: "text", text: "Failed to get forecast URL" }] };
    }

    const forecastData = await makeNWSRequest<{properties: {periods: any[]}}>(forecastUrl);
    if (!forecastData) {
      return { content: [{ type: "text", text: "Failed to retrieve forecast data" }] };
    }

    const periods = forecastData.properties?.periods || [];
    const formattedForecast = periods.map((period: any) =>
      [
        `${period.name || "Unknown"}:`,
        `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
        `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
        `${period.shortForecast || "No forecast available"}`,
        "---"
      ].join("\n")
    );

    const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;
    return { content: [{ type: "text", text: forecastText }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

Build: `npm run build`

## Claude Desktop Configuration

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

**Python:**
```json
{
  "mcpServers": {
    "weather": {
      "command": "uv",
      "args": ["--directory", "/ABSOLUTE/PATH/TO/weather", "run", "weather.py"]
    }
  }
}
```

**TypeScript:**
```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/weather/build/index.js"]
    }
  }
}
```

Restart Claude Desktop after saving.

## Testing

Ask Claude:
- "What's the weather in Sacramento?"
- "What are the active weather alerts in Texas?"

Look for the tools icon in Claude Desktop to verify server connection.

## Important Notes

- **STDIO Servers**: Never use `print()`, `console.log()`, or stdout - use stderr for logging
- **Paths**: Use absolute paths in config
- **US Only**: NWS API only works for US locations
- **Restart**: Always restart Claude Desktop after config changes

## Troubleshooting

Check logs: `tail -f ~/Library/Logs/Claude/mcp*.log`

Common issues:
- Incorrect absolute paths
- JSON syntax errors in config
- Server build failures
- Missing dependencies
