/**
 * Edge Runtime configuration
 *
 * This file provides utilities for configuring and running API routes in Edge Runtime
 */

export const edgeConfig = {
  runtime: "edge",
};

/**
 * List of API routes that should use Edge Runtime
 */
export const edgeRoutes = [
  "/api/v1/threads", // Thread listing (better performance)
  "/api/v1/threads/*/send", // Message sending (lower latency)
  "/api/v1/threads/*/read", // Read status updates (lower latency)
  "/api/v1/webhooks/gmail", // Gmail webhooks (high availability)
  "/api/v1/webhooks/twilio", // Twilio webhooks (high availability)
];

/**
 * Check if a route should use Edge Runtime
 */
export const shouldUseEdgeRuntime = (pathname: string): boolean => {
  return edgeRoutes.some((route) => {
    const pattern = route.replace("*", ".*");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
};
