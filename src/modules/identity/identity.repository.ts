import type { UserResponse } from "./identity.dto.js";

export class IdentityRepository {
  constructor() {}

  async getUserByID(id: string): Promise<UserResponse> {}
}
