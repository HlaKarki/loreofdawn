2. Sync Clerk users to your DB:

Create webhook endpoint in worker to populate usersTable:

// POST /webhooks/clerk
// Clerk sends user.created events → insert into usersTable

3. Get token on frontend:

import { useAuth } from '@clerk/nextjs'

const { getToken } = useAuth()
const token = await getToken()

// Send to your worker:
fetch('/v1/ai/ask', {
headers: { Authorization: `Bearer ${token}` }
})
