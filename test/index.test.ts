import { createCookieSessionStorage } from "@remix-run/node";
import { DiscordStrategy, type DiscordStrategyOptions } from "../src";

describe(DiscordStrategy, () => {
  const verify = jest.fn();
  const strategyDefaultOptions = {
    clientID: "CLIENT_ID",
    clientSecret: "CLIENT_SECRET",
    callbackURL: "https://example.app/callback",
  };
  const sessionStorage = createCookieSessionStorage({
    cookie: { secrets: ["s3cr3t"] },
  });
  const sessionAuthenticateOptions = {
    sessionKey: "user",
    sessionErrorKey: "auth:error",
    sessionStrategyKey: "strategy",
    name: "__session",
  };
  const testDiscordStrategy = async (
    strategyOptions: Partial<DiscordStrategyOptions>,
    callback: (error: Error | Response) => void,
  ) => {
    try {
      const strategy = new DiscordStrategy(
        { ...strategyDefaultOptions, ...strategyOptions },
        verify,
      );
      const request = new Request("https://example.app/auth/discord");
      await strategy.authenticate(
        request,
        sessionStorage,
        sessionAuthenticateOptions,
      );
    } catch (error) {
      return callback(error);
    }
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should allow changing the scope", async () => {
    await testDiscordStrategy({ scope: ["guilds"] }, (error) => {
      if (!(error instanceof Response)) throw error;
      expect(error).toBeInstanceOf(Response);
      const location = error.headers.get("Location");

      if (!location) throw new Error("No redirect header");

      const redirectUrl = new URL(location);

      expect(redirectUrl.searchParams.get("scope")).toBe("guilds");
    });
  });

  test("should have the scope `identify email` as default", async () => {
    await testDiscordStrategy({}, (error) => {
      if (!(error instanceof Response)) throw error;
      expect(error).toBeInstanceOf(Response);
      const location = error.headers.get("Location");

      if (!location) throw new Error("No redirect header");

      const redirectUrl = new URL(location);

      expect(redirectUrl.searchParams.get("scope")).toBe("identify email");
    });
  });

  test("should require integrationType when scope `applications.commands` is added", async () => {
    await testDiscordStrategy(
      { scope: ["email", "applications.commands", "identify"] },
      (error) => {
        if (!(error instanceof Error)) throw error;
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe(
          "integrationType is required when scope contains applications.commands",
        );
      },
    );
  });

  test("should correctly format the authorization URL", async () => {
    await testDiscordStrategy({}, (error) => {
      if (!(error instanceof Response)) throw error;
      expect(error).toBeInstanceOf(Response);
      const location = error.headers.get("Location");

      if (!location) throw new Error("No redirect header");

      const redirectUrl = new URL(location);

      expect(redirectUrl.hostname).toBe("discord.com");
      expect(redirectUrl.pathname).toBe("/api/v10/oauth2/authorize");
    });
  });
});
