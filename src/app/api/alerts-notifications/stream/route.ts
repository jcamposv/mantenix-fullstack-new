import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// Global map to store SSE connections by user ID
const connections = new Map<string, ReadableStreamDefaultController[]>()

// Helper function to broadcast to all connections for a user
function broadcastToUser(userId: string, data: unknown) {
  const userConnections = connections.get(userId) || []
  const encoder = new TextEncoder()
  const message = encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
  
  // Send to all connections for this user and remove closed ones
  const activeConnections = userConnections.filter(controller => {
    try {
      controller.enqueue(message)
      return true
    } catch {
      return false // Connection closed
    }
  })
  
  if (activeConnections.length > 0) {
    connections.set(userId, activeConnections)
  } else {
    connections.delete(userId)
  }
}

// Helper function to broadcast to all users (for system-wide notifications)
function broadcastToAll(data: unknown) {
  const encoder = new TextEncoder()
  const message = encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
  
  for (const [userId, userConnections] of connections.entries()) {
    const activeConnections = userConnections.filter(controller => {
      try {
        controller.enqueue(message)
        return true
      } catch {
        return false
      }
    })
    
    if (activeConnections.length > 0) {
      connections.set(userId, activeConnections)
    } else {
      connections.delete(userId)
    }
  }
}

// GET /api/notifications/stream - Server-Sent Events endpoint for real-time notifications
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const userId = session.user.id
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start(controller) {
        console.log(`SSE connection started for user: ${userId}`)
        
        // Add this connection to the user's connections
        const userConnections = connections.get(userId) || []
        userConnections.push(controller)
        connections.set(userId, userConnections)

        // Send initial connection message
        const welcomeMessage = encoder.encode(`data: ${JSON.stringify({
          type: 'connected',
          message: 'SSE connection established',
          timestamp: new Date().toISOString()
        })}\n\n`)
        controller.enqueue(welcomeMessage)

        // Send heartbeat every 30 seconds to keep connection alive
        const keepAliveInterval = setInterval(() => {
          try {
            const heartbeat = encoder.encode(`data: ${JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            })}\n\n`)
            controller.enqueue(heartbeat)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            console.log(`Heartbeat failed for user ${userId}, connection likely closed`)
            clearInterval(keepAliveInterval)
            // Remove this controller from the connections
            const userConnections = connections.get(userId) || []
            const updatedConnections = userConnections.filter(c => c !== controller)
            if (updatedConnections.length > 0) {
              connections.set(userId, updatedConnections)
            } else {
              connections.delete(userId)
            }
          }
        }, 30000)

        // Clean up when connection closes
        return () => {
          console.log(`SSE connection closed for user: ${userId}`)
          clearInterval(keepAliveInterval)
          
          // Remove this controller from the connections
          const userConnections = connections.get(userId) || []
          const updatedConnections = userConnections.filter(c => c !== controller)
          if (updatedConnections.length > 0) {
            connections.set(userId, updatedConnections)
          } else {
            connections.delete(userId)
          }
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error) {
    console.error("Error in SSE endpoint:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

// Export the broadcast functions for use in other parts of the app
export { broadcastToUser, broadcastToAll }