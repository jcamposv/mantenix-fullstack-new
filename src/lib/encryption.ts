import crypto from 'crypto'

export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64')
}

export function encrypt(text: string, key: string): string {
  const algorithm = 'aes-256-gcm'
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(algorithm, key)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

export function decrypt(encryptedText: string, key: string): string {
  const algorithm = 'aes-256-gcm'
  const parts = encryptedText.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  
  const decipher = crypto.createDecipher(algorithm, key)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}