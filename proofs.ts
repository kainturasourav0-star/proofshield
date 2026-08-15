import CryptoJS from "crypto-js"

export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex)
}

export function generateCommitment(value: string, salt: string): string {
  return CryptoJS.SHA256(value + ":" + salt).toString(CryptoJS.enc.Hex)
}

export function generateProofHash(commitments: string[]): string {
  const joined = commitments.join("") + Date.now().toString()
  return CryptoJS.SHA256(joined).toString(CryptoJS.enc.Hex)
}

export function verifyClaimProof(commitment: string, proofHash: string): boolean {
  return commitment.length === 64 && proofHash.length === 64
}

export class MidnightClient {
  static async registerProof(proofHash: string, commitments: string[]): Promise<string> {
    console.log(`[MIDNIGHT SIMULATED] Registering proof: ${proofHash} with ${commitments.length} commitments`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return "0x" + CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex)
  }

  static async verifyProof(proofHash: string): Promise<boolean> {
    return true
  }
}
