import axios from 'axios';
import Debug from 'debug';

import Aladdin from './';
import { Device, Door, DurationRule, History, TimeRangeRule } from './types';



export class GarageDoor {
  protected log = Debug(`AladdinConnect:${this.door.name}`);
  protected debugBody = Debug(`AladdinConnect:${this.door.name}:Body's`);
  protected debugResponse = Debug(`AladdinConnect:${this.door.name}:Responses`);
  constructor(public readonly aladdin: Aladdin, public device: Device, public door: Door, public rules: (TimeRangeRule | DurationRule)[]) {
    this.log.color = '33';
    this.debugBody.color = '51';
    this.debugResponse.color = '49';
  }

  get(): Promise<[Device, Door]> {
    return new Promise((resolve, reject) => {
      //If the acount is the "owner" then we can directly access the door, otherwise we need to re-fetch the whole configuration
      if (this.aladdin.Configuration.invites.recv.find(invite => invite.user_id === this.door.user_id)) {
        this.log('Getting Door Via Configuration');
        axios({
          method: 'get',
          url: 'https://16375mc41i.execute-api.us-east-1.amazonaws.com/IOS/configuration',
          headers: {
            'Host': '16375mc41i.execute-api.us-east-1.amazonaws.com',
            'Accept': '*/*',
            'Authorization': `${this.aladdin.tokenType} ${this.aladdin.accessToken}`,
            'app_version': '5.17',
            'X-API-KEY': '2BcHhgzjAa58BXkpbYM977jFvr3pJUhH52nflMuS',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Aladdin%20Connect/75 CFNetwork/1335.0.2 Darwin/21.6.0',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
          },
          validateStatus: (status) => {
            return status === 200;
          },
          timeout: 60000,
          timeoutErrorMessage: 'Request Timed Out',
        }).then(response => {
          this.debugResponse(response.data);
          const device = response.data.devices.find(device => device.id === this.device.id);
          const GarageDoor: [Device, Door] = [device, device.doors.find(door => door.id === this.door.id)];
          this.device = GarageDoor[0];
          this.door = GarageDoor[1];
          resolve(GarageDoor);
          resolve(GarageDoor);
        }).catch(err => reject(this.aladdin.parseError(err)));
      } else {
        this.log('Getting Door Via Device');
        axios({
          method: 'get',
          url: `https://16375mc41i.execute-api.us-east-1.amazonaws.com/IOS/devices/${this.device.id}`,
          headers: {
            'Host': '16375mc41i.execute-api.us-east-1.amazonaws.com',
            'Accept': '*/*',
            'Authorization': `${this.aladdin.tokenType} ${this.aladdin.accessToken}`,
            'app_version': '5.17',
            'X-API-KEY': '2BcHhgzjAa58BXkpbYM977jFvr3pJUhH52nflMuS',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Aladdin%20Connect/75 CFNetwork/1335.0.2 Darwin/21.6.0',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
          },
          validateStatus: (status) => {
            return status === 200;
          },
          timeout: 60000,
          timeoutErrorMessage: 'Request Timed Out',
        }).then(response => {
          this.debugResponse(response.data);
          const GarageDoor: [Device, Door] = [response.data, response.data.doors.find(door1 => door1.id === this.door.id)];
          this.device = GarageDoor[0];
          this.door = GarageDoor[1];
          resolve(GarageDoor);
        }).catch(err => reject(this.aladdin.parseError(err)));
      }
    });
  }

  open(): Promise<Record<string, never>> {
    this.log('Opening Door');
    return new Promise((resolve, reject) => {
      const invite = this.aladdin.Configuration.invites.recv.find(invite => invite.user_id === this.door.user_id);
      const body = JSON.stringify(invite ? { command_key: 'OpenDoor', invite_id: invite.id } : { command_key: 'OpenDoor' });
      this.debugBody(body);
      axios({
        method: 'post',
        url: `https://16375mc41i.execute-api.us-east-1.amazonaws.com/IOS/devices/${this.device.id}` +
          `/door/${this.door.door_index}/command`,
        data: body,
        headers: {
          'Host': '16375mc41i.execute-api.us-east-1.amazonaws.com',
          'Accept': '*/*',
          'Authorization': `${this.aladdin.tokenType} ${this.aladdin.accessToken}`,
          'app_version': '5.17',
          'X-API-KEY': '2BcHhgzjAa58BXkpbYM977jFvr3pJUhH52nflMuS',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Length': body.length,
          'User-Agent': 'Aladdin%20Connect/75 CFNetwork/1335.0.2 Darwin/21.6.0',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json',
        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 60000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => {
        this.debugResponse(response.data);
        resolve(response.data);
      }).catch(error => reject(this.aladdin.parseError(error)));
    });
  }

  close(): Promise<Record<string, never>> {
    this.log('Closing Door');
    return new Promise((resolve, reject) => {
      const invite = this.aladdin.Configuration.invites.recv.find(invite => invite.user_id === this.door.user_id);
      const body = JSON.stringify(invite ? { command_key: 'CloseDoor', invite_id: invite.id } : { command_key: 'CloseDoor' });
      this.debugBody(body);
      axios({
        method: 'post',
        url: `https://16375mc41i.execute-api.us-east-1.amazonaws.com/IOS/devices/${this.device.id}` +
          `/door/${this.door.door_index}/command`,
        data: body,
        headers: {
          'Host': '16375mc41i.execute-api.us-east-1.amazonaws.com',
          'Accept': '*/*',
          'Authorization': `${this.aladdin.tokenType} ${this.aladdin.accessToken}`,
          'app_version': '5.17',
          'X-API-KEY': '2BcHhgzjAa58BXkpbYM977jFvr3pJUhH52nflMuS',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Length': body.length,
          'User-Agent': 'Aladdin%20Connect/75 CFNetwork/1335.0.2 Darwin/21.6.0',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json',
        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 60000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => {
        this.debugResponse(response.data);
        resolve(response.data);
      }).catch(error => reject(this.aladdin.parseError(error)));
    });
  }

  getHistory(limit: number, days?: number): Promise<History[]> {
    this.log('Getting History');
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: `https://16375mc41i.execute-api.us-east-1.amazonaws.com/IOS/devices/${this.device.id}` +
          `/door/${this.door.door_index}/command/history?limit=${limit}${days ? `&days=${days}` : ''}`,
        headers: {
          'Host': '16375mc41i.execute-api.us-east-1.amazonaws.com',
          'Accept': '*/*',
          'Authorization': `${this.aladdin.tokenType} ${this.aladdin.accessToken}`,
          'app_version': '5.17',
          'X-API-KEY': '2BcHhgzjAa58BXkpbYM977jFvr3pJUhH52nflMuS',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'User-Agent': 'Aladdin%20Connect/75 CFNetwork/1335.0.2 Darwin/21.6.0',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json',
        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 60000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => {
        this.debugResponse(response.data);
        resolve(response.data);
      }).catch(err => reject(this.aladdin.parseError(err)));
    });
  }
}

//W.I.P.
//Note: New Rule: Post, Modify Rule: Put, Delete Rule: Delete, Get Rule: Get
/*
class Rules {
  constructor(public readonly aladdin: Aladdin) { }

  add(rule: DurationRuleTemplate): Promise<DurationRule>;
  add(rule: TimeRangeRuleTemplate): Promise<TimeRangeRule>;
  add(rule: DurationRuleTemplate | TimeRangeRuleTemplate): Promise<DurationRule | TimeRangeRule> {
    const config = {
      headers: {
        'Host': '16375mc41i.execute-api.us-east-1.amazonaws.com',
        'Accept': '*//*',
'Authorization': `${this.aladdin.tokenType} ${this.aladdin.accessToken}`,
'app_version': '5.17',
'X-API-KEY': '2BcHhgzjAa58BXkpbYM977jFvr3pJUhH52nflMuS',
'Accept-Language': 'en-US,en;q=0.9',
'Accept-Encoding': 'gzip, deflate, br',
'User-Agent': 'Aladdin%20Connect/75 CFNetwork/1335.0.2 Darwin/21.6.0',
'Connection': 'keep-alive',
'Content-Type': 'application/json',
},
validateStatus: (status) => {
return status === 200;
},
timeout: 60000,
timeoutErrorMessage: 'Request Timed Out',
};
return new Promise((resolve, reject) => {
switch (rule.id) {
case 0:
break;
default:
break;
}
});
}
}
interface DurationRuleInfo {
days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
id: 0;
longer_than_duration_conditions: {
duration: number;
door_operation: 'none' | 'close';
send_notification: boolean;
};
condition_type: 'longer_than_duration';
name: string;
}
*/