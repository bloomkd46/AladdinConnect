export interface AladdinError {
  name: string;
  message: string;
  request?: {
    method: 'GET' | 'POST';
    protocol: 'https:' | 'http:';
    host: string;
    path: string;
    headers: string[];
  };
  response?: {
    statusCode: number;
    statusMessage: string;
    headers: object;
    data: object;
  };
}
export interface LoginResponse {
  refresh_token: string;
  token_type: 'bearer';
  user_id: number;
  expires_in: number;
  access_token: string;
  scope: 'operator';
}

export interface Device {
  is_locked: boolean;
  family: number;
  id: number;
  legacy_id: string;
  location_id: number;
  ssid: string;
  updated_at: string;
  user_id: number;
  rssi: number;
  model: string;
  description: string | '';
  legacy_key: string;
  created_at: string;
  lua_version: string;
  timezone: string;
  status: number;
  doors: Door[];
  message?: string;
  is_enabled: boolean;
  zipcode: string;
  is_expired: boolean;
  location_name: string;
  serial: string;
  vendor: 'GENIE' | string;
  ownership: 'owned' | 'full-share' | string;
  name: string;
  is_updating_firmware: boolean;
}
export interface Door {
  desired_door_status_outcome: 'success' | string;
  updated_at: string;
  desired_door_status: 'Close' | 'Open';
  id: number;
  user_id: number;
  vehicle_color: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PINK' | 'PURPLE' | string;
  door_index: number;
  icon: number;
  link_status: DoorLink;
  door_updated_at: string;
  created_at: string;
  desired_status: DesiredDoorStatus;
  status: DoorStatus;
  fault: number;
  ble_strength: number;
  is_enabled: boolean;
  battery_level: number;
  device_id: number;
  name: string;
  vehicle_type: 'CAR' | 'TRUCK' | 'VAN' | 'SUV' | string;
}
enum DoorLink {
  UNKNOWN = 0,
  NOT_CONFIGURED = 1,
  PAIRED = 2,
  CONNECTED = 3,
}
enum DesiredDoorStatus {
  CLOSED = 0,
  OPEN = 1,
  NONE = 99, // Once the garage is in the desired state Genie reports this.
}
enum DoorStatus {
  UNKNOWN = 0,
  OPEN = 1,
  OPENING = 2,
  TIMEOUT_OPENING = 3,
  CLOSED = 4,
  CLOSING = 5,
  TIMEOUT_CLOSING = 6,
  NOT_CONFIGURED = 7,
}

export interface Configuration {
  invites: {
    sent: Invite[];
    recv: Invite[];
    settings: {
      user_id?: number;
      temperary_access_enabled: boolean;
      id?: number;
    };
  };
  locations: Location[];
  devices: Device[];
  rules: (TimeRangeRule | DurationRule)[];
  partners: Partner[];
  refresh_status: 'success' | string;
  message: string;
  isOneP: boolean;
}
interface Invite {
  updated_at: string;
  to: {
    allowed: boolean;
    id: number;
    email: string;
    name: string;
    override_schedule: boolean;
  };
  id: number;
  is_enabled: boolean;
  created_at: string;
  owner_name: string;
  user_id: number;
  owner_email: string;
  status: 'accepted' | 'declined' | string;
  name: string;
  type: 'full' | string;
}
interface Location {
  updated_at: string;
  legacy_rid: string;
  id: number;
  is_enabled: boolean;
  created_at: string;
  legacy_id: string;
  user_id: number;
  legacy_key: string;
  name: string;
  description: string;
}
export interface TimeRangeRule {
  updated_at: string;
  devices: RuleDevice[];
  is_enabled: boolean;
  created_at: string;
  id: number;
  condition_type: 'during_time_range';
  user_id: number;
  during_time_range_conditions?: {
    send_notification: boolean;
    end_time: string;
    door_state: 'open';
    start_time: string;
    door_operation: 'none' | 'close';
  };
  name: string;
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
}
export interface DurationRule {
  updated_at: string;
  devices: RuleDevice[];
  is_enabled: boolean;
  created_at: string;
  id: number;
  condition_type: 'longer_than_duration';
  user_id: number;
  longer_than_duration_conditions?: {
    send_notification: boolean;
    door_state: 'open';
    duration: number;
    door_operation: 'none' | 'close';
  };
  name: string;
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
}
interface RuleDevice {
  rule_id: number;
  id: number;
  doors: RuleDoor[];
  name: string;
  serial: string;
}
interface RuleDoor {
  door_index: number;
  device_id: number;
  name: string;
  id: number;
}
interface Partner {
  ac_promo_start_content_url?: string;
  icon: string;
  id: number;
  description: string;
  ohd_promo_start_content_url?: string;
  linked: boolean;
  info_url: string;
  enabled_ad?: boolean;
  ios_deep_link: string;
  display_order: number;
  ad_order?: number;
  android_deep_link: string;
  name: string;
  partner_identifier?: 'WALMART' | 'ALEXA';
}

export interface DurationRuleTemplate {
  owner_email: '';
  is_enabled: boolean;
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  id: 0 | number;
  longer_than_duration_conditions: {
    duration: number;
    door_operation: 'none' | 'close';
    send_notification: boolean;
    door_state: 'open';
  };
  owner_name: '';
  condition_type: 'longer_than_duration';
  devices: RuleTemplateDevice[];
  name: string;
}
export interface TimeRangeRuleTemplate {
  owner_email: '';
  is_enabled: boolean;
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  id: 0;
  during_time_range_conditions: {
    send_notification: boolean;
    door_operation: 'none' | 'close';
    start_time: string;
    end_time: string;
    door_state: 'open';
  };
  owner_name: '';
  condition_type: 'during_time_range';
  devices: RuleTemplateDevice[];
  name: string;
}
interface RuleTemplateDevice {
  id: number;
  doors: RuleTemplateDoor[];
  serial: string;
  name: string;
}
interface RuleTemplateDoor {
  door: number;
}

export interface History {
  message: string;
  commands: Command[];
}
interface Command {
  updated_at: string;
  invoker_type: 'invitee' | 'owner';
  id: number;
  device_name: string;
  outcome_at: string;
  invoker_name: string;
  client_id: 100 | 1000;
  user_id: number;
  outcome_type: 'success' | 'none';
  command_received_at: string;
  invoker_description: string;
  client_name: 'Mobile App' | 'Local';
  status: number;
  invite_id: number;
  device_id: number;
  created_at: string;
  command_param: '' | '1';
  command_type: 'CloseDoor' | 'OpenDoor';
  door_name: string;
  door_index: number;
}