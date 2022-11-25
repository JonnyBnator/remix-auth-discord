import type { StrategyVerifyCallback } from "remix-auth";
import {
  OAuth2Profile,
  OAuth2Strategy,
  OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";

/**
 * These are all the available scopes Discord allows.
 * @see https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
 */
export type DiscordScope =
  | "activities.read"
  | "activities.write"
  | "applications.builds.read"
  | "applications.builds.upload"
  | "applications.commands"
  | "applications.commands.update"
  | "applications.entitlements"
  | "applications.store.update"
  | "bot"
  | "connections"
  | "email"
  | "gdm.join"
  | "guilds"
  | "guilds.join"
  | "guilds.members.read"
  | "identify"
  | "messages.read"
  | "relationships.read"
  | "rpc"
  | "rpc.activities.write"
  | "rpc.notifications.read"
  | "rpc.voice.read"
  | "rpc.voice.write"
  | "webhook.incoming";

/**
 * These are all the available Guild Features
 * @see https://discord.com/developers/docs/resources/guild#guild-object-guild-features
 */
type DiscordGuildFeature =
  | "ANIMATED_BANNER"
  | "ANIMATED_ICON"
  | "APPLICATION_COMMAND_PERMISSIONS_V2"
  | "AUTO_MODERATION"
  | "BANNER"
  | "COMMUNITY"
  | "DEVELOPER_SUPPORT_SERVER"
  | "DISCOVERABLE"
  | "FEATURABLE"
  | "INVITES_DISABLED"
  | "INVITE_SPLASH"
  | "MEMBER_VERIFICATION_GATE_ENABLED"
  | "MONETIZATION_ENABLED"
  | "MORE_STICKERS"
  | "NEWS"
  | "PARTNERED"
  | "PREVIEW_ENABLED"
  | "ROLE_ICONS"
  | "TICKETED_EVENTS_ENABLED"
  | "VANITY_URL"
  | "VERIFIED"
  | "VIP_REGIONS"
  | "WELCOME_SCREEN_ENABLED";

/**
 * This represents a Discord Guild as returned by the API with the guilds scope enabled.
 * @see https://discord.com/developers/docs/resources/user#get-current-user-guilds
 */
export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: Array<DiscordGuildFeature>;
}
/**
 * This interface declares what configuration the strategy needs from the
 * developer to correctly work.
 */
export interface DiscordStrategyOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  /**
   * @default ["identify", "email"]
   */
  scope?: Array<DiscordScope>;
  prompt?: "none" | "consent";
}

export interface DiscordExtraParams
  extends Record<string, Array<DiscordScope> | string | number> {
  expires_in: 604_800;
  token_type: "Bearer";
  scope: Array<DiscordScope>;
}

export interface DiscordProfile extends OAuth2Profile {
  id: string;
  displayName: string;
  emails?: [{ value: string }];
  photos?: [{ value: string }];
  __json: {
    /**
     * The user's id
     */
    id: string;
    /**
     * The user's username, not unique across the platform
     */
    username: string;
    /**
     * The user's 4-digit discord-tag
     */
    discriminator: string;
    /**
     * The user's avatar hash
     * @see https://discord.com/developers/docs/reference#image-formatting
     */
    avatar: string | null;
    /**
     * Whether the user belongs to an OAuth2 application
     */
    bot?: boolean;
    /**
     * Whether the user is an Official Discord System user (part of the urgent message system)
     */
    system?: boolean;
    /**
     * Whether the user has two factor enabled on their account
     */
    mfa_enabled?: boolean;
    /**
     * The user's banner hash
     * @see https://discord.com/developers/docs/reference#image-formatting
     */
    banner?: string | null;
    /**
     * The user's banner color encoded as an integer representation of hexadecimal color code
     */
    accent_color?: string | null;
    /**
     * The user's chosen language option
     */
    locale?: string;
    /**
     * Whether the email on this account has been verified
     */
    verified?: boolean;
    /**
     * The user's email
     */
    email?: string | null;
    /**
     * The flags on a user's account
     * @see https://discord.com/developers/docs/resources/user#user-object-user-flags
     */
    flags?: number;
    /**
     * The type of Nitro subscription on a user's account
     * @see https://discord.com/developers/docs/resources/user#user-object-premium-types
     */
    premium_type?: number;
    /**
     * The public flags on a user's account
     * @see https://discord.com/developers/docs/resources/user#user-object-user-flags
     */
    public_flags?: number;
  };
}

export class DiscordStrategy<User> extends OAuth2Strategy<
  User,
  DiscordProfile,
  DiscordExtraParams
> {
  name = "discord";

  private scope: Array<DiscordScope>;
  private prompt?: "none" | "consent";
  private userInfoURL = "https://discord.com/api/users/@me";

  constructor(
    {
      clientID,
      clientSecret,
      callbackURL,
      scope,
      prompt,
    }: DiscordStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<DiscordProfile, DiscordExtraParams>
    >
  ) {
    super(
      {
        clientID,
        clientSecret,
        callbackURL,
        authorizationURL: "https://discord.com/api/oauth2/authorize",
        tokenURL: "https://discord.com/api/oauth2/token",
      },
      verify
    );

    this.scope = scope ? scope : ["identify", "email"];

    this.prompt = prompt;
  }

  protected authorizationParams() {
    const params = new URLSearchParams({
      scope: this.scope.join(" "),
    });
    if (this.prompt) params.set("prompt", this.prompt);
    return params;
  }

  protected async userProfile(accessToken: string): Promise<DiscordProfile> {
    const response = await fetch(this.userInfoURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const raw: DiscordProfile["__json"] = await response.json();

    const profile: DiscordProfile = {
      provider: "discord",
      id: raw.id,
      displayName: raw.username,
      emails: raw.email ? [{ value: raw.email }] : undefined,
      photos: raw.avatar ? [{ value: raw.avatar }] : undefined,
      __json: raw,
    };

    return profile;
  }

  protected async getAccessToken(response: Response): Promise<{
    accessToken: string;
    refreshToken: string;
    extraParams: DiscordExtraParams;
  }> {
    const { access_token, refresh_token, scope, ...extraParams } =
      await response.json();
    return {
      accessToken: access_token as string,
      refreshToken: refresh_token as string,
      extraParams: { ...extraParams, scope: scope.split(" ") },
    } as const;
  }
}
