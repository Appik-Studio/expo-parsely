// Shared consent state — avoids circular imports between ExpoParselyModule and HeartbeatManager
let consentGiven = false

export function getConsentGiven(): boolean {
  return consentGiven
}

export function setConsentGiven(given: boolean): void {
  consentGiven = given
}
