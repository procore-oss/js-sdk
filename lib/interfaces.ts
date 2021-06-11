export interface Authorizer {
  authorize(unauthorizedRequest: Function): Promise<any>
}
