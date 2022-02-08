import * as https from "https";

class CrService {
  constructor() { }

  async getSuggestion(suggestionLink: string) {
    const suggestionId = suggestionLink.split(/\//).pop();
    const url = 'https://api.cyberrepublic.org/api/suggestion/' + suggestionId + '/show?incViewsNum=true'

    return new Promise((resolve, reject) => {
      const request = https.get(url, (response: any) => {
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(new Error('Failed to load page, status code: ' + response.statusCode));
        }
        const body: any[] = [];
        response.on('data', (chunk: any) => body.push(chunk));
        response.on('end', () => resolve(body.join('')));
      });

      request.on('error', (err: any) => reject(err))
    })
  }

}

export const crService = new CrService();
