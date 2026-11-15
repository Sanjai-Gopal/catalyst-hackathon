import { Client, Account, OAuthProvider } from 'appwrite'

// Public Appwrite identifiers (not secrets). Server-only keys live in /api env vars.
const endpoint =
  import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
const projectId =
  import.meta.env.VITE_APPWRITE_PROJECT_ID || '6af86666003a589a4773'

const client = new Client()
client.setEndpoint(endpoint).setProject(projectId)

export const account = new Account(client)
export { OAuthProvider }
