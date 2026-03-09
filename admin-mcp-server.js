#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Read environment variables for configuration
const NEXT_URL = process.env.NEXT_URL || "http://localhost:1001";
const ADMIN_COOKIE = process.env.ADMIN_COOKIE;

if (!ADMIN_COOKIE) {
    console.error("FATAL ERROR: ADMIN_COOKIE environment variable is required.");
    console.error("Please provide your admin session cookie to authenticate requests.");
    process.exit(1);
}

/**
 * Helper to make authenticated requests to the Next.js API.
 * Forwards the ADMIN_COOKIE to ensure the user has admin privileges.
 */
async function fetchAdminApi(endpoint, options = {}) {
    const url = `${NEXT_URL}${endpoint}`;

    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            "Content-Type": "application/json",
            "Cookie": ADMIN_COOKIE,
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error ${res.status}: ${text}`);
    }

    return await res.json();
}

const server = new Server(
    {
        name: "rubrhythm-admin-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * Register the available tools for the AI to call.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_admin_stats",
                description: "Fetch real-time statistics from the RubRhythm Admin Dashboard (/api/admin/system). Includes users count, listings, financial escrow data, and pending moderation queue.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "list_pending_verifications",
                description: "List all users who have submitted ID verification documents and are awaiting admin approval (/api/admin/verifications?status=pending).",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "manage_user",
                description: "Manage a user via the RubRhythm Admin API (/api/admin/users). You can list users, ban/unban, or verify a user.",
                inputSchema: {
                    type: "object",
                    properties: {
                        action: {
                            type: "string",
                            description: "Action to perform: 'list' (fetches all users), 'ban' (bans/unbans a user), 'verify' (verifies/unverifies a user)",
                            enum: ["list", "ban", "verify"]
                        },
                        userId: {
                            type: "string",
                            description: "The unique ID of the user (required for 'ban' or 'verify' actions)"
                        },
                        value: {
                            type: "boolean",
                            description: "For 'ban' or 'verify' actions: true to apply the ban/verification, false to revoke it."
                        }
                    },
                    required: ["action"],
                },
            },
        ],
    };
});

/**
 * Handle execution of AI tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        // 1. Tool: get_admin_stats
        if (request.params.name === "get_admin_stats") {
            console.error("[MCP] Executing get_admin_stats...");
            const data = await fetchAdminApi("/api/admin/system");
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        }

        // 2. Tool: list_pending_verifications
        else if (request.params.name === "list_pending_verifications") {
            console.error("[MCP] Executing list_pending_verifications...");
            const data = await fetchAdminApi("/api/admin/verifications?status=pending");
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        }

        // 3. Tool: manage_user
        else if (request.params.name === "manage_user") {
            const args = request.params.arguments || {};
            const { action, userId, value } = args;

            console.error(`[MCP] Executing manage_user (action: ${action})...`);

            if (action === "list") {
                const data = await fetchAdminApi("/api/admin/users");
                return {
                    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
                };
            }

            if (!userId) {
                throw new Error("Missing required argument 'userId' for action '" + action + "'.");
            }

            const payload = {
                userId,
                action,
                value: Boolean(value),
            };

            const data = await fetchAdminApi("/api/admin/users", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        }

        throw new Error("Unknown tool requested: " + request.params.name);
    } catch (error) {
        console.error("[MCP Error]:", error);
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `Error executing tool: ${error.message}`,
                }
            ]
        };
    }
});

/**
 * Start the MCP StdIO server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("RubRhythm Admin MCP Server running on stdio transport.");
    console.error("Ready to handle tools: get_admin_stats, list_pending_verifications, manage_user");
}

main().catch(console.error);
