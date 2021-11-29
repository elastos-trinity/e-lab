import moment from "moment";

/**
 * Tells if votes are currently open.
 * Vote during 7 days, between each 15 and 21.
 */
export const currentlyInVotePeriod = () => {
  let now = moment();
  return now.date() >= 15 && now.date() <= 21;
}

/**
 * Returns information about the current vote period (start, end)
 */
export const getVotePeriodInfo = () => {
  let now = moment();

  let startDate; let endDate;
  // If we are between the 15 and the 21 of a month, this is a vote period. So we return the current period.
  if (currentlyInVotePeriod()) {
    // We are in a vote period
    startDate = now.clone().startOf("day").set("day", 15);
    endDate = startDate.clone().add(7, "days");
  }
  else {
    // We are outside of a vote period
    startDate = now.clone().startOf("month").add(1, "month").add(14, "days");
    endDate = startDate.clone().add(7, "days").subtract(1, "minute");
  }

  return {
    startDate,
    displayableStartDate: startDate.format("DD/MM"),
    endDate,
    displayableEndDate: endDate.format("DD/MM")
  }
}

/**
 * Tells if a given milliseconds timestamp is more than one month before the vote period start
 */
export const msTimestampIsMoreThanOneMonthBeforeVotePeriodStart = (timestampMs) => {
  let votePeriod = getVotePeriodInfo();
  return moment.unix(timestampMs / 1000).add(1, "month").isBefore(votePeriod.startDate);
}
