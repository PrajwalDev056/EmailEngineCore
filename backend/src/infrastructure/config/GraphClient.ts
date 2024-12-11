import { Client } from '@microsoft/microsoft-graph-client';

export class GraphClient {
  public static getClient(accessToken: string): Client {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }
}
