import moment from "moment";
import { format, formatDistanceToNow } from 'date-fns';

export function fDate(date) {
  return format(new Date(date), 'dd MMMM yyyy');
}

export function fDateTime(date) {
  return format(new Date(date), 'dd MMM yyyy HH:mm');
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), 'dd/MM/yyyy hh:mm p');
}

export function fDateTimeNormal(date) {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true
  });
}

/**
 * Tells if a given milliseconds timestamp is more than one month old or not.
 */
export const msTimestampIsMoreThanOneMonthAgo = (timestampMs) => {
  let now = moment();
  return moment.unix(timestampMs / 1000).add(1, "month").isBefore(now);
}