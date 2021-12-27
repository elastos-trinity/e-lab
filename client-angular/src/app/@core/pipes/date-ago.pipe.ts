import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'dateAgo',
  pure: true
})
export class DateAgoPipe implements PipeTransform {

  transform(value: any, arguments_?: any): any {
    if (value) {
      const seconds = Math.floor((Date.now() - +new Date(value)) / 1000);

      if (seconds < 29) // less than 30 seconds ago will show as 'Just now'
        return 'Just now';

      const intervals: {year: number, month: number,
        week: number, day:number,
        hour: number, minute: number, second: number} = {
        'year': 31_536_000,
        'month': 2_592_000,
        'week': 604_800,
        'day': 86_400,
        'hour': 3600,
        'minute': 60,
        'second': 1
      };

      let counter;

      for (const index in intervals) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        counter = Math.floor(seconds / intervals[index]);
        if (counter > 0)
          return counter === 1 ? counter + ' ' + index + ' ago' : counter + ' ' + index + 's ago';
      }

    }
    return value;
  }

}
