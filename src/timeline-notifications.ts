import { requestApi } from './api';
import { TwitterAuth } from './auth';
import { ApiError } from './errors';

// --- Helper Interfaces ---

interface UrlEntity {
  display_url: string;
  expanded_url: string;
  url: string;
  indices: [number, number];
}

interface HashtagEntity {
  indices: [number, number];
  text: string;
}

interface UserMentionEntity {
  id_str: string;
  name: string;
  screen_name: string;
  indices: [number, number];
}

interface MediaEntitySize {
  h: number;
  w: number;
  resize: 'fit' | 'crop';
}

interface MediaEntity {
  display_url: string;
  expanded_url: string;
  id_str: string;
  indices: [number, number];
  media_key: string;
  media_url_https: string;
  type: 'photo' | 'video' | 'animated_gif';
  url: string;
  ext_media_availability: { status: string };
  features?: Record<string, unknown>; // Can be detailed further if needed
  sizes: {
    large: MediaEntitySize;
    medium: MediaEntitySize;
    small: MediaEntitySize;
    thumb: MediaEntitySize;
  };
  original_info: {
    height: number;
    width: number;
    focus_rects?: Array<{ x: number; y: number; w: number; h: number }>;
  };
  allow_download_status?: { allow_download: boolean };
  video_info?: {
    aspect_ratio: [number, number];
    duration_millis: number;
    variants: Array<{
      bitrate?: number;
      content_type: string;
      url: string;
    }>;
  };
  media_results?: { result: { media_key: string } };
  additional_media_info?: { monetizable: boolean };
}

interface DescriptionEntities {
  urls?: UrlEntity[];
  hashtags?: HashtagEntity[];
  user_mentions?: UserMentionEntity[];
  symbols?: any[]; // Define further if needed
}

interface TweetEntities extends DescriptionEntities {
  media?: MediaEntity[];
  timestamps?: any[]; // Define further if needed
}

interface CardBindingValueImage {
  image_value: {
    height: number;
    width: number;
    url: string;
  };
  type: 'IMAGE';
}

interface CardBindingValueString {
  string_value: string;
  type: 'STRING';
  scribe_key?: string;
}

interface CardBindingValueImageColor {
  image_color_value: {
    palette: Array<{
      rgb: { blue: number; green: number; red: number };
      percentage: number;
    }>;
  };
  type: 'IMAGE_COLOR';
}

type CardBindingValue =
  | CardBindingValueImage
  | CardBindingValueString
  | CardBindingValueImageColor;

interface CardLegacy {
  binding_values: CardBindingValue[];
  card_platform: {
    platform: {
      audience: { name: string };
      device: { name: string; version: string };
    };
  };
  name: string;
  url: string;
  user_refs_results: any[]; // Define further if needed
}

// --- Core Interfaces ---

interface TimelineUserLegacy {
  following: boolean;
  followed_by?: boolean;
  can_dm: boolean;
  can_media_tag: boolean;
  created_at: string;
  default_profile: boolean;
  default_profile_image: boolean;
  description: string;
  entities: {
    description: DescriptionEntities;
    url?: { urls: UrlEntity[] };
  };
  fast_followers_count: number;
  favourites_count: number;
  followers_count: number;
  friends_count: number;
  has_custom_timelines: boolean;
  is_translator: boolean;
  listed_count: number;
  location: string;
  media_count: number;
  name: string;
  needs_phone_verification?: boolean;
  normal_followers_count: number;
  pinned_tweet_ids_str: string[];
  possibly_sensitive: boolean;
  profile_banner_url?: string;
  profile_image_url_https: string;
  profile_interstitial_type: string;
  screen_name: string;
  statuses_count: number;
  translator_type: string;
  url?: string;
  verified: boolean;
  verified_type?: string; // e.g., "Business"
  want_retweets: boolean;
  withheld_in_countries: string[];
}

interface TimelineTweetLegacy {
  bookmark_count: number;
  bookmarked: boolean;
  created_at: string;
  conversation_id_str: string;
  display_text_range: [number, number];
  entities: TweetEntities;
  extended_entities?: { media: MediaEntity[] };
  favorite_count: number;
  favorited: boolean;
  full_text: string;
  in_reply_to_screen_name?: string;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id_str?: string;
  is_quote_status: boolean;
  lang: string;
  possibly_sensitive?: boolean;
  possibly_sensitive_editable?: boolean;
  quote_count: number;
  quoted_status_id_str?: string;
  quoted_status_permalink?: {
    url: string;
    expanded: string;
    display: string;
  };
  reply_count: number;
  retweet_count: number;
  retweeted: boolean;
  user_id_str: string;
  id_str: string;
  retweeted_status_result?: { result: NotificationsTimelineTweetResult }; // For Retweets
}

interface ProfessionalDetails {
  rest_id: string;
  professional_type: string; // e.g., "Business", "Creator"
  category: Array<{
    id: number;
    name: string;
    icon_name: string;
  }>;
}

interface TipJarSettings {
  is_enabled?: boolean;
  bitcoin_handle?: string;
  cash_app_handle?: string;
  patreon_handle?: string;
  gofundme_handle?: string;
}

interface TimelineUserResult {
  __typename: 'User';
  id: string; // GraphQL ID e.g., "VXNlcj..."
  rest_id: string; // Numeric ID
  affiliates_highlighted_label: Record<string, unknown>; // Often empty
  has_graduated_access: boolean;
  is_blue_verified: boolean;
  legacy: TimelineUserLegacy;
  parody_commentary_fan_label?: string; // e.g., "None"
  profile_image_shape: 'Circle' | 'Square';
  professional?: ProfessionalDetails;
  tipjar_settings: TipJarSettings;
  super_follow_eligible?: boolean;
}

interface EditControl {
  edit_tweet_ids: string[];
  editable_until_msecs: string;
  is_edit_eligible: boolean;
  edits_remaining: string;
}

interface TweetViews {
  count?: string; // Sometimes present
  state: 'Enabled' | 'EnabledWithCount';
}

interface NoteTweetResult {
  id: string;
  text: string;
  entity_set: TweetEntities;
  richtext: { richtext_tags: any[] }; // Define further if needed
  media: { inline_media: any[] }; // Define further if needed
}

export interface NotificationsTimelineTweetResult {
  __typename: 'Tweet';
  rest_id: string;
  core: {
    user_results: {
      result: TimelineUserResult;
    };
  };
  unmention_data: Record<string, unknown>; // Often empty
  edit_control: EditControl;
  is_translatable: boolean;
  views: TweetViews;
  source: string; // HTML string
  note_tweet?: {
    is_expandable: boolean;
    note_tweet_results: {
      result: NoteTweetResult;
    };
  };
  grok_analysis_button?: boolean;
  quotedRefResult?: { result: { __typename: 'Tweet'; rest_id: string } }; // Simplified
  quoted_status_result?: { result: NotificationsTimelineTweetResult };
  legacy: TimelineTweetLegacy;
  card?: {
    rest_id: string;
    legacy: CardLegacy;
  };
  retweeted_status_result?: { result: NotificationsTimelineTweetResult }; // Added for Retweets
}

interface TimelineRichTextEntity {
  fromIndex: number;
  toIndex: number;
  format?: string;
  ref?: {
    type: 'TimelineRichTextUser';
    user_results: {
      result: TimelineUserResult;
    };
  };
}

interface TimelineRichText {
  rtl?: boolean;
  text: string;
  entities: TimelineRichTextEntity[];
}

interface TimelineNotificationURL {
  url: string;
  urlType: 'ExternalUrl' | 'UrtEndpoint';
  urtEndpointOptions?: {
    cacheId: string;
    subtitle: string;
    title: string;
  };
}

interface TimelineNotificationTargetObject {
  __typename: 'TimelineNotificationTweetRef' | string; // Allow other types
  tweet_results?: {
    result: NotificationsTimelineTweetResult;
  };
}

interface TimelineNotificationFromUser {
  __typename: 'TimelineNotificationUserRef';
  user_results: {
    result: TimelineUserResult;
  };
}

interface TimelineNotificationTemplate {
  __typename: 'TimelineNotificationAggregateUserActions' | string; // Allow other types
  target_objects: TimelineNotificationTargetObject[];
  from_users: TimelineNotificationFromUser[];
  additional_context?: TimelineRichText;
  show_all_link_text?: string; // For aggregated likes etc.
}

// --- Item Content Union Type ---

interface TimelineItemContentNotification {
  itemType: 'TimelineNotification';
  __typename: 'TimelineNotification';
  id: string;
  notification_icon: string; // e.g., "heart_icon", "live_icon", "recommendation_icon"
  rich_message: TimelineRichText;
  notification_url: TimelineNotificationURL;
  template: TimelineNotificationTemplate;
  timestamp_ms: string;
}

interface TimelineItemContentTweet {
  itemType: 'TimelineTweet';
  __typename: 'TimelineTweet';
  tweet_results: {
    result: NotificationsTimelineTweetResult;
  };
  tweetDisplayType: 'Tweet'; // Or potentially other types?
}

type TimelineItemContent =
  | TimelineItemContentNotification
  | TimelineItemContentTweet;

// --- Entry Content Union Type ---

interface TimelineEntryContentCursor {
  entryType: 'TimelineTimelineCursor';
  __typename: 'TimelineTimelineCursor';
  value: string;
  cursorType: 'Top' | 'Bottom';
}

interface ClientEventInfoDetails {
  notificationDetails?: {
    impressionId: string;
    metadata: string;
  };
  // Add other possible details structures if needed
}

interface ClientEventInfo {
  component: string; // e.g., "urt"
  element: string; // e.g., "users_liked_your_tweet", "generic_magic_rec_live_broadcast"
  details?: ClientEventInfoDetails;
}

interface FeedbackInfo {
  clientEventInfo: ClientEventInfo;
  feedbackKeys: string[];
  feedbackMetadata: string;
}

interface TimelineEntryContentItem {
  entryType: 'TimelineTimelineItem';
  __typename: 'TimelineTimelineItem';
  itemContent: TimelineItemContent;
  feedbackInfo?: FeedbackInfo;
  clientEventInfo?: ClientEventInfo;
}

type TimelineEntryContent =
  | TimelineEntryContentCursor
  | TimelineEntryContentItem;

// --- Timeline Instruction and Main Response ---

interface TimelineEntry {
  entryId: string;
  sortIndex: string;
  content: TimelineEntryContent;
}

interface TimelineInstructionAddEntries {
  type: 'TimelineAddEntries';
  entries: TimelineEntry[];
}

interface TimelineInstructionClearCache {
  type: 'TimelineClearCache';
}

interface TimelineInstructionClearUnread {
  type: 'TimelineClearEntriesUnreadState';
}

interface TimelineInstructionMarkUnread {
  type: 'TimelineMarkEntriesUnreadGreaterThanSortIndex';
  sort_index: string;
}

type TimelineInstruction =
  | TimelineInstructionAddEntries
  | TimelineInstructionClearCache
  | TimelineInstructionClearUnread
  | TimelineInstructionMarkUnread;

interface FeedbackActionValue {
  feedbackType: string;
  prompt: string;
  confirmation: string;
  feedbackUrl: string;
  hasUndoAction: boolean;
  confirmationDisplayType: string;
  clientEventInfo: {
    action: string;
  };
}

interface FeedbackAction {
  key: string;
  value: FeedbackActionValue;
}

export interface NotificationsTimelineResponse {
  data?: {
    viewer_v2: {
      user_results: {
        result: {
          __typename: 'User'; // Top level user is viewer
          rest_id: string;
          notification_timeline: {
            id: string;
            timeline: {
              instructions: TimelineInstruction[];
              responseObjects?: {
                feedbackActions?: FeedbackAction[];
              };
            };
          };
        };
      };
    };
  };
}

function parseMentions(
  timeline: NotificationsTimelineResponse,
): NotificationsTimelineTweetResult[] {
  const instructions =
    timeline.data?.viewer_v2.user_results.result.notification_timeline.timeline
      .instructions;

  if (!instructions) {
    return [];
  }

  // Use flatMap to iterate through instructions and their entries, extracting tweet results directly
  const mentionTweets: NotificationsTimelineTweetResult[] = instructions
    .flatMap((instruction) => {
      // Only process 'TimelineAddEntries' instructions that have entries
      if (instruction.type !== 'TimelineAddEntries' || !instruction.entries) {
        return []; // Return empty array for flatMap to ignore this instruction
      }

      // Map over entries, attempting to extract tweet results
      return instruction.entries.map((entry) => {
        // Check if the entry content is a TimelineItem containing a TimelineTweet
        if (
          entry.content.__typename === 'TimelineTimelineItem' &&
          entry.content.itemContent?.__typename === 'TimelineTweet'
        ) {
          // Type assertion is safe here due to the checks above
          const tweetResult = (
            entry.content.itemContent as TimelineItemContentTweet
          ).tweet_results?.result;
          // Return the tweet result if it exists and is of type 'Tweet'
          return tweetResult && tweetResult.__typename === 'Tweet'
            ? tweetResult
            : null;
        }
        // Return null if it's not the expected entry type or item type
        return null;
      });
    })
    // Filter out any nulls that were returned during mapping
    .filter(
      (tweet): tweet is NotificationsTimelineTweetResult => tweet != null,
    );

  return mentionTweets;
}

export async function fetchMentions(count: number, auth: TwitterAuth) {
  const features = {
    rweb_video_screen_enabled: false,
    profile_label_improvements_pcf_label_in_post_enabled: true,
    rweb_tipjar_consumption_enabled: true,
    verified_phone_label_enabled: false,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    premium_content_api_read_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    responsive_web_grok_analyze_button_fetch_trends_enabled: false,
    responsive_web_grok_analyze_post_followups_enabled: true,
    responsive_web_jetfuel_frame: false,
    responsive_web_grok_share_attachment_enabled: true,
    articles_preview_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true,
    tweet_awards_web_tipping_enabled: false,
    responsive_web_grok_show_grok_translated_post: false,
    responsive_web_grok_analysis_button_from_backend: true,
    creator_subscriptions_quote_tweet_preview_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
      true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    responsive_web_grok_image_annotation_enabled: true,
    responsive_web_enhance_cards_enabled: false,
  };

  const res = await requestApi<NotificationsTimelineResponse>(
    `https://x.com/i/api/graphql/3L-e1o67sOYxl8xVrZ0W5g/NotificationsTimeline?variables=${JSON.stringify(
      {
        timeline_type: 'Mentions',
        count,
      },
    )}&features=${encodeURIComponent(JSON.stringify(features))}`,
    auth,
    'GET',
  );

  if (!res.success) {
    if (res.err instanceof ApiError) {
      console.error('Error details:', res.err.data);
    }
    throw res.err;
  }

  return parseMentions(res.value);
}
