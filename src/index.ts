import axios, { AxiosError } from 'axios';
import { EventEmitter } from 'events';
import Debug from 'debug';
import { AladdinError, Configuration, DurationRule, LoginResponse, TimeRangeRule } from './types';
import { GarageDoor } from './garageDoor';

export * from './types';
export * from './garageDoor';
export default class Aladdin {
  public events = new EventEmitter();
  public accessToken = '';
  public tokenType = '';
  public GarageDoors: GarageDoor[] = [];
  public Rules: (TimeRangeRule | DurationRule)[] = [];
  public Configuration!: Configuration;

  protected log = Debug('AladdinConnect');
  protected debugBody = Debug('AladdinConnect:Body\'s');
  protected debugResponse = Debug('AladdinConnect:Responses');

  protected error = Debug('AladdinConnect:Error');
  protected errorInfo = Debug('AladdinConnect:ErrorInfo');

  protected constructor(readonly email: string, readonly password: string) {
    this.error.color = '1';
    this.errorInfo.color = '124';
    this.log.color = '33';
    this.debugBody.color = '51';
    this.debugResponse.color = '49';

    this.events.setMaxListeners(0);
    this.events.on('authenticated', (data: LoginResponse) => {
      this.log('Authenticated');
      this.accessToken = data.access_token;
      this.tokenType = data.token_type.charAt(0).toUpperCase() + data.token_type.slice(1);
      setTimeout(() => {
        this.login(email, password).then(data => {
          this.events.emit('authenticated', data);
        }).catch(err => this.events.emit('error', err));
      }, (data.expires_in - 1) * 1000);
    });
    this.login(email, password).then(data => {
      this.events.emit('authenticated', data);
      this.getRules().then(rules => {
        this.Rules = rules.rules;
        this.getConfiguration().then(config => {
          this.Configuration = config;
          this.events.emit('initialized');
        }).catch(err => this.events.emit('error', err));
      }).catch(err => this.events.emit('error', err));
    }).catch(err => this.events.emit('error', err));
  }

  public static connect(email: string, password: string): Promise<GarageDoor[]> {
    return new Promise((resolve, reject) => {
      try {
        const aladdin = new Aladdin(email, password);
        aladdin.events.on('error', err => {
          aladdin.error('Setup Failed'); reject(err);
        });
        aladdin.events.on('initialized', () => {
          aladdin.log('Initialized');
          aladdin.Configuration.devices.forEach(device => device.doors.forEach(door => aladdin.GarageDoors.push(
            new GarageDoor(aladdin, device, door,
              aladdin.Rules.filter(rule => rule.devices.find(device2 => device2.doors.find(door2 => door2.id === door.id)))))));
          aladdin.log('Setup Completed');
          resolve(aladdin.GarageDoors);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  protected login(email: string, password: string): Promise<LoginResponse> {
    this.log('Logging In');
    return new Promise((resolve, reject) => {
      const body = `password=${Buffer.from(password).toString('base64')}&build_number=75&brand=ALADDIN&username=${email}` +
        '&app_version=5.17&grant_type=password&model=iPhone13%2C1&client_id=1000&os_version=15.6&platform=IOS';
      this.debugBody(body);
      axios({
        method: 'post',
        url: 'https://16375mc41i.execute-api.us-east-1.amazonaws.com/IOS/oauth/token',
        data: body,
        headers: {
          'Host': '16375mc41i.execute-api.us-east-1.amazonaws.com',
          'Accept': '*/*',
          'app_version': '5.17',
          'X-API-KEY': '2BcHhgzjAa58BXkpbYM977jFvr3pJUhH52nflMuS',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Length': body.length,
          'User-Agent': 'Aladdin%20Connect/75 CFNetwork/1335.0.2 Darwin/21.6.0',
          'Connection': 'keep-alive',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 60000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => {
        this.debugResponse(response.data);
        resolve(response.data);
      }).catch(error => reject(this.parseError(error)));
    });
  }

  protected getConfiguration(): Promise<Configuration> {
    this.log('Getting Configuration');
    return new Promise<Configuration>((resolve, reject) => {
      axios({
        method: 'get',
        url: 'https://16375mc41i.execute-api.us-east-1.amazonaws.com/IOS/configuration',
        headers: {
          'Host': '16375mc41i.execute-api.us-east-1.amazonaws.com',
          'Accept': '*/*',
          'Authorization': `${this.tokenType} ${this.accessToken}`,
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
      }).catch(err => reject(this.parseError(err)));
    });
  }

  protected getRules(): Promise<{ message: string; rules: (DurationRule | TimeRangeRule)[] }> {
    this.log('Getting Rules');
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: 'https://16375mc41i.execute-api.us-east-1.amazonaws.com/IOS/rules',
        headers: {
          'Host': '16375mc41i.execute-api.us-east-1.amazonaws.com',
          'Accept': '*/*',
          'Authorization': `${this.tokenType} ${this.accessToken}`,
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
      }).catch(err => reject(this.parseError(err)));
    });
  }

  public logout(): Promise<'OK'> {
    this.log('Logging Out');
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        url: 'https://16375mc41i.execute-api.us-east-1.amazonaws.com/IOS/session/logout',
        headers: {
          'Host': '16375mc41i.execute-api.us-east-1.amazonaws.com',
          'Accept': '*/*',
          'Authorization': `${this.tokenType} ${this.accessToken}`,
          'app_version': '5.17',
          'X-API-KEY': '2BcHhgzjAa58BXkpbYM977jFvr3pJUhH52nflMuS',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Length': 0,
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
      }).catch(error => reject(this.parseError(error)));
    });
  }

  public parseError(axiosError: AxiosError): AladdinError {
    const Error: AladdinError = {
      name: axiosError.name,
      message: axiosError.message,
    };
    if (axiosError.request) {
      Error.request = {
        method: axiosError.request.method,
        protocol: axiosError.request.protocol,
        host: axiosError.request.host,
        path: axiosError.request.path,
        headers: (axiosError.request._header?.split('\r\n') as string[] | undefined)?.filter(x => x) || [],
      };
    }
    if (axiosError.response) {
      Error.response = {
        statusCode: axiosError.response.status,
        statusMessage: axiosError.response.statusText,
        headers: axiosError.response.headers,
        data: axiosError.response.data,
      };
    }
    this.error(Error.message);
    this.errorInfo(Error);
    return Error;
  }
}
