/**
 * Symbol registry for InversifyJS dependency injection.
 * Keeps all service identifiers in one place for consistency and refactor safety.
 */

export const TYPES = {
  // Security/Middleware bindings
  IAuthHandler: Symbol.for('IAuthHandler'),
  SecurityConfig: Symbol.for('SecurityConfig'),

  // Controller bindings
  IHealthCheckController: Symbol.for('IHealthCheckController'),
  IIasMediaApiController: Symbol.for('IIasMediaApiController'),

  // Helper bindings
  IAxiosHelper: Symbol.for('IAxiosHelper'),

  // Service bindings
  IIasMediaService: Symbol.for('IIasMediaService'),
  IS3ConnectorService: Symbol.for('IS3ConnectorService'),
} as const;