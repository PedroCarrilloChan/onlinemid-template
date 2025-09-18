import { getStorage } from '../shared/storage';
import { insertUserSchema } from '../../shared/schema';
import { ZodError } from 'zod';

// Types for Cloudflare Pages Functions
interface CloudflareEnvironment {
  // Add environment variables here
  DATABASE_URL?: string;
  [key: string]: unknown;
}

interface CloudflareExecutionContext {
  request: Request;
  env: CloudflareEnvironment;
  params: {
    path: string;
  };
  next: () => Promise<Response>;
  waitUntil: (promise: Promise<any>) => void;
}


// Utility functions for responses (CORS handled in middleware)
const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const errorResponse = (message: string, status = 500) => {
  return jsonResponse({ error: message }, status);
};

// Enhanced router interface to include parameter extraction
interface Route {
  method: string;
  path: string;
  handler: (context: CloudflareExecutionContext, params: Record<string, string>) => Promise<Response>;
}

// Routes array - actual API routes with parameterized paths
const routes: Route[] = [
  // Get user by ID: GET /api/users/:id
  {
    method: 'GET',
    path: '/api/users/:id',
    handler: async (context, params) => {
      const userId = params.id;
      const storage = getStorage(context.env);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return errorResponse('User not found', 404);
      }
      
      return jsonResponse(user);
    }
  },
  
  // Get user by username: GET /api/users/username/:username
  {
    method: 'GET',
    path: '/api/users/username/:username',
    handler: async (context, params) => {
      const username = params.username;
      const storage = getStorage(context.env);
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return errorResponse('User not found', 404);
      }
      
      return jsonResponse(user);
    }
  },
  
  // Create new user: POST /api/users
  {
    method: 'POST',
    path: '/api/users',
    handler: async (context, params) => {
      try {
        const body = await context.request.json();
        
        // Validate request body
        const validatedData = insertUserSchema.parse(body);
        
        const storage = getStorage(context.env);
        
        // Create new user (storage handles uniqueness checking)
        const newUser = await storage.createUser(validatedData);
        
        return jsonResponse(newUser, 201);
        
      } catch (error) {
        if (error instanceof ZodError) {
          return errorResponse('Invalid request data', 400);
        }
        
        if (error instanceof Error && error.message === 'Username already exists') {
          return errorResponse('Username already exists', 409);
        }
        
        throw error; // Re-throw for general error handling
      }
    }
  }
];

// Enhanced path matcher that extracts parameters
function matchRoute(method: string, path: string): { route: Route; params: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method) continue;
    
    // Handle exact matches
    if (route.path === path) {
      return { route, params: {} };
    }
    
    // Handle parameterized routes
    const routeSegments = route.path.split('/').filter(Boolean);
    const pathSegments = path.split('/').filter(Boolean);
    
    // Different segment counts means no match
    if (routeSegments.length !== pathSegments.length) continue;
    
    // Check each segment and extract parameters
    const params: Record<string, string> = {};
    let matches = true;
    
    for (let i = 0; i < routeSegments.length; i++) {
      const routeSegment = routeSegments[i];
      const pathSegment = pathSegments[i];
      
      // If route segment is a parameter (starts with :), extract it
      if (routeSegment.startsWith(':')) {
        const paramName = routeSegment.slice(1);
        params[paramName] = pathSegment;
      } else if (routeSegment !== pathSegment) {
        // Otherwise, it must be an exact match
        matches = false;
        break;
      }
    }
    
    if (matches) {
      return { route, params };
    }
  }
  
  return null;
}

// Main function handler for Cloudflare Pages
export async function onRequest(context: CloudflareExecutionContext): Promise<Response> {
  const { request } = context;
  const method = request.method;
  
  // Get the path from the URL directly (more reliable than params.path)
  const apiPath = new URL(request.url).pathname;

  try {
    // Find matching route and extract parameters
    const match = matchRoute(method, apiPath);
    
    if (!match) {
      return errorResponse(`Route not found: ${method} ${apiPath}`, 404);
    }

    // Execute route handler with extracted parameters
    return await match.route.handler(context, match.params);
    
  } catch (error) {
    console.error('API Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal Server Error'
    );
  }
}

// Export the utilities for use in other files
export { jsonResponse, errorResponse, type CloudflareExecutionContext, type CloudflareEnvironment };