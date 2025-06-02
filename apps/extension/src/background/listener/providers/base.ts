export type GeneratorEmail = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

export class BaseProvider {
  constructor() {}

  async *listenForNewEmails(): AsyncGenerator<GeneratorEmail> {
    throw new Error("Not implemented");
  }

  async getLatestEmails(count: number): Promise<GeneratorEmail[]> {
    throw new Error("Not implemented");
  }
}
