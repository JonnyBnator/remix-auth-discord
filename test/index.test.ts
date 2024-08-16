import { createCookieSessionStorage } from "@remix-run/node";
import { DiscordStrategy } from "../src";

describe(DiscordStrategy, () => {
  const verify = jest.fn();
  const sessionStorage = createCookieSessionStorage({
    cookie: { secrets: ["s3cr3t"] },
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should allow changing the scope", async () => {
    const strategy = new DiscordStrategy(
      {
        clientID: "CLIENT_ID",
        clientSecret: "CLIENT_SECRET",
        callbackURL: "https://example.app/callback",
        scope: ["guilds"],
      },
      verify,
    );

    const request = new Request("https://example.app/auth/discord");

    try {
      await strategy.authenticate(request, sessionStorage, {
        sessionKey: "user",
        sessionErrorKey: "auth:error",
        sessionStrategyKey: "strategy",
        name: "__session",
      });
    } catch (error) {
      if (!(error instanceof Response)) throw error;
      const location = error.headers.get("Location");

      if (!location) throw new Error("No redirect header");

      const redirectUrl = new URL(location);

      expect(redirectUrl.searchParams.get("scope")).toBe("guilds");
    }
  });

  test("should have the scope `identify email` as default", async () => {
    const strategy = new DiscordStrategy(
      {
        clientID: "CLIENT_ID",
        clientSecret: "CLIENT_SECRET",
        callbackURL: "https://example.app/callback",
      },
      verify,
    );

    const request = new Request("https://example.app/auth/discord");

    try {
      await strategy.authenticate(request, sessionStorage, {
        sessionKey: "user",
        sessionErrorKey: "auth:error",
        sessionStrategyKey: "strategy",
        name: "__session",
      });
    } catch (error) {
      if (!(error instanceof Response)) throw error;
      const location = error.headers.get("Location");

      if (!location) throw new Error("No redirect header");

      const redirectUrl = new URL(location);

      expect(redirectUrl.searchParams.get("scope")).toBe("identify email");
    }
  });

  test("should require integrationType when scope `applications.commands` is added", async () => {
    try {
      const strategy = new DiscordStrategy(
        {
          clientID: "CLIENT_ID",
          clientSecret: "CLIENT_SECRET",
          callbackURL: "https://example.app/callback",
          scope: ["email", "applications.commands", "identify"],
        },
        verify,
      );

      const request = new Request("https://example.app/auth/discord");

      await strategy.authenticate(request, sessionStorage, {
        sessionKey: "user",
        sessionErrorKey: "auth:error",
        sessionStrategyKey: "strategy",
        name: "__session",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        "integrationType is required when scope contains applications.commands",
      );
    }
  });

  test("should correctly set the integrationType", async () => {
    const strategy = new DiscordStrategy(
      {
        clientID: "CLIENT_ID",
        clientSecret: "CLIENT_SECRET",
        callbackURL: "https://example.app/callback",
        scope: ["email", "applications.commands", "identify"],
        integrationType: 1,
      },
      verify,
    );

    const request = new Request("https://example.app/auth/discord");

    try {
      await strategy.authenticate(request, sessionStorage, {
        sessionKey: "user",
        sessionErrorKey: "auth:error",
        sessionStrategyKey: "strategy",
        name: "__session",
      });
    } catch (error) {
      if (!(error instanceof Response)) throw error;
      const location = error.headers.get("Location");

      if (!location) throw new Error("No redirect header");

      const redirectUrl = new URL(location);

      expect(redirectUrl.searchParams.get("integration_type")).toBe("1");
    }
  });

  test("should correctly format the authorization URL", async () => {
    const strategy = new DiscordStrategy(
      {
        clientID: "CLIENT_ID",
        clientSecret: "CLIENT_SECRET",
        callbackURL: "https://example.app/callback",
      },
      verify,
    );

    const request = new Request("https://example.app/auth/discord");

    try {
      await strategy.authenticate(request, sessionStorage, {
        sessionKey: "user",
        sessionErrorKey: "auth:error",
        sessionStrategyKey: "strategy",
        name: "__session",
      });
    } catch (error) {
      if (!(error instanceof Response)) throw error;

      const location = error.headers.get("Location");

      if (!location) throw new Error("No redirect header");

      const redirectUrl = new URL(location);

      expect(redirectUrl.hostname).toBe("discord.com");
      expect(redirectUrl.pathname).toBe("/api/v10/oauth2/authorize");
    }
  });
});
