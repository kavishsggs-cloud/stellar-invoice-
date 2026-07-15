import { describe, it, expect } from "vitest";
import { useExplorer } from "../hooks/useExplorer";

describe("useExplorer", () => {
  it("should generate correct transaction URLs", () => {
    const { getTransactionUrl } = useExplorer();
    const hash = "1234567890abcdef";
    
    expect(getTransactionUrl(hash, "testnet")).toBe(`https://stellar.expert/explorer/testnet/tx/${hash}`);
    expect(getTransactionUrl(hash, "public")).toBe(`https://stellar.expert/explorer/public/tx/${hash}`);
  });

  it("should generate correct account URLs", () => {
    const { getAccountUrl } = useExplorer();
    const account = "GA1234567890";
    
    expect(getAccountUrl(account, "testnet")).toBe(`https://stellar.expert/explorer/testnet/account/${account}`);
  });
});
