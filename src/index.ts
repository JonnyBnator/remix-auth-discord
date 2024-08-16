import type { StrategyVerifyCallback } from "remix-auth";
import {
  OAuth2Profile,
  OAuth2Strategy,
  OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";

const discordApiBaseURL = "https://discord.com/api/v10";

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
  | "applications.commands.permissions.update"
  | "applications.entitlements"
  | "applications.store.update"
  | "bot"
  | "connections"
  | "dm_channels.read"
  | "email"
  | "gdm.join"
  | "guilds"
  | "guilds.join"
  | "guilds.members.read"
  | "identify"
  | "messages.read"
  | "relationships.read"
  | "role_connections.write"
  | "rpc"
  | "rpc.activities.write"
  | "rpc.notifications.read"
  | "rpc.voice.read"
  | "rpc.voice.write"
  | "voice"
  | "webhook.incoming";

/**
 * The integration_type parameter specifies the installation context for the authorization.
 * The installation context determines where the application will be installed,
 * and is only relevant when scope contains applications.commands.
 * When set to 0 (GUILD_INSTALL) the application will be authorized for installation to a server,
 * and when set to 1 (USER_INSTALL) the application will be authorized for installation to a user.
 * The application must be configured in the Developer Portal to support the provided integration_type.
 * @see https://discord.com/developers/docs/resources/application#application-object-application-integration-types
 */
export enum DiscordIntegrationType {
  GUILD_INSTALL = 0,
  USER_INSTALL = 1,
}

/**
 * These are all the available Guild Features
 * @see https://discord.com/developers/docs/resources/guild#guild-object-guild-features
 */
export type DiscordGuildFeature =
  | "ANIMATED_BANNER"
  | "ANIMATED_ICON"
  | "APPLICATION_COMMAND_PERMISSIONS_V2"
  | "AUTO_MODERATION"
  | "BANNER"
  | "COMMUNITY"
  | "CREATOR_MONETIZABLE_PROVISIONAL"
  | "CREATOR_STORE_PAGE"
  | "DEVELOPER_SUPPORT_SERVER"
  | "DISCOVERABLE"
  | "FEATURABLE"
  | "INVITES_DISABLED"
  | "INVITE_SPLASH"
  | "MEMBER_VERIFICATION_GATE_ENABLED"
  | "MORE_STICKERS"
  | "NEWS"
  | "PARTNERED"
  | "PREVIEW_ENABLED"
  | "RAID_ALERTS_DISABLED"
  | "ROLE_ICONS"
  | "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE"
  | "ROLE_SUBSCRIPTIONS_ENABLED"
  | "TICKETED_EVENTS_ENABLED"
  | "VANITY_URL"
  | "VERIFIED"
  | "VIP_REGIONS"
  | "WELCOME_SCREEN_ENABLED";

/**
 * These are all the available Discord locales
 * @see https://discord.com/developers/docs/reference#locales
 */
export type DiscordLocale =
  | "id"
  | "da"
  | "de"
  | "en-GB"
  | "en-US"
  | "es-ES"
  | "es-419"
  | "fr"
  | "hr"
  | "it"
  | "lt"
  | "hu"
  | "nl"
  | "no"
  | "pl"
  | "pt-BR"
  | "ro"
  | "fi"
  | "sv-SE"
  | "vi"
  | "tr"
  | "cs"
  | "el"
  | "bg"
  | "ru"
  | "uk"
  | "hi"
  | "th"
  | "zh-CN"
  | "ja"
  | "zh-TW"
  | "ko";
/**
 * This represents a Discord Guild as returned by the API with the guilds scope enabled.
 * @see https://discord.com/developers/docs/resources/user#get-current-user-guilds
 */
export interface PartialDiscordGuild {
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
  integrationType?: DiscordIntegrationType;
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
     * The user's display name, if it is set. For bots, this is the application name
     */
    global_name: string | null;
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
    locale?: DiscordLocale;
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
    /**
     * the user's avatar decoration hash
     * @see https://discord.com/developers/docs/reference#image-formatting
     */
    avatar_decoration?: string | null;
  };
}

export const DiscordStrategyDefaultName = "discord";

export class DiscordStrategy<User> extends OAuth2Strategy<
  User,
  DiscordProfile,
  DiscordExtraParams
> {
  name = DiscordStrategyDefaultName;

  scope: string;
  private integrationType?: DiscordStrategyOptions["integrationType"];
  private prompt?: "none" | "consent";
  private userInfoURL = `${discordApiBaseURL}/users/@me`;

  constructor(
    {
      clientID,
      clientSecret,
      callbackURL,
      scope,
      integrationType,
      prompt,
    }: DiscordStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<DiscordProfile, DiscordExtraParams>
    >,
  ) {
    super(
      {
        clientID,
        clientSecret,
        callbackURL,
        authorizationURL: `${discordApiBaseURL}/oauth2/authorize`,
        tokenURL: `${discordApiBaseURL}/oauth2/token`,
      },
      verify,
    );

    this.scope = (scope ?? ["identify", "email"]).join(" ");
    if (
      scope?.includes("applications.commands") &&
      integrationType === undefined
    )
      throw new Error(
        "integrationType is required when scope contains applications.commands",
      );
    if (
      integrationType &&
      !Object.values(DiscordIntegrationType).includes(integrationType)
    )
      throw new Error("integrationType must be a valid DiscordIntegrationType");
    this.integrationType = integrationType;
    this.prompt = prompt;
  }

  protected authorizationParams() {
    const params = new URLSearchParams({
      scope: this.scope,
    });
    if (this.integrationType)
      params.set("integration_type", this.integrationType.toString());
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
      provider: DiscordStrategyDefaultName,
      id: raw.id,
      displayName: raw.global_name ?? raw.username,
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
