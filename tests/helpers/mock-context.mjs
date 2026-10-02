/**
 * Mocking Utilities for Next.js Requests and Clerk Session Context
 */

/**
 * Creates a mock NextRequest object conforming to Next.js Route Handler interface
 */
export function createMockNextRequest(urlStr, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    searchParams = {},
  } = options;

  const url = new URL(urlStr, 'http://localhost:3000');
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  return {
    method,
    url: url.toString(),
    nextUrl: url,
    headers: {
      get(name) {
        return headers[name.toLowerCase()] || null;
      },
      ...headers,
    },
    async json() {
      if (typeof body === 'string') {
        return JSON.parse(body);
      }
      return body || {};
    },
    async text() {
      if (typeof body === 'string') {
        return body;
      }
      return JSON.stringify(body || {});
    },
  };
}

/**
 * Creates a mock Clerk Auth context
 */
export function createMockClerkAuth(userId = null, role = null, metadata = {}) {
  return {
    userId,
    sessionId: userId ? `sess_${userId}` : null,
    sessionClaims: userId
      ? {
          sub: userId,
          metadata: {
            role,
            ...metadata,
          },
        }
      : null,
  };
}

/**
 * In-memory Mock Data Store for testing complex multi-table workflows
 */
export class InMemoryAcademyStore {
  constructor() {
    this.profiles = new Map();
    this.students = new Map();
    this.billing = new Map();
    this.attendance = new Map();
    this.notifications = new Map();
    this.paymentTickets = new Map();
    this.courses = new Map();
    this.teacherApplications = new Map();
  }

  reset() {
    this.profiles.clear();
    this.students.clear();
    this.billing.clear();
    this.attendance.clear();
    this.notifications.clear();
    this.paymentTickets.clear();
    this.courses.clear();
    this.teacherApplications.clear();
  }
}
