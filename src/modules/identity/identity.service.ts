import { IdentityRepository } from "./identity.repository.js";

export class IdentityService {
  constructor(private readonly identityRepository: IdentityRepository) {}

  async createUserAndAccount() {}
}
