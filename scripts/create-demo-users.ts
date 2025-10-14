/**
 * Create demo users using Better Auth API
 */

import { auth } from '../src/lib/auth'

async function createDemoUsers() {
  console.log('🌱 Creating demo users via Better Auth API...')

  const users = [
    {
      email: 'admin@acme.com',
      password: 'AdminEmpresa123!@#',
      name: 'John Doe'
    },
    {
      email: 'supervisor@acme.com', 
      password: 'Supervisor123!@#',
      name: 'Jane Smith'
    },
    {
      email: 'tech@acme.com',
      password: 'Tecnico123!@#', 
      name: 'Mike Johnson'
    },
    {
      email: 'client@acme.com',
      password: 'Cliente123!@#',
      name: 'Sarah Wilson'
    },
    {
      email: 'admin@techservices.com',
      password: 'AdminEmpresa123!@#',
      name: 'Carlos Rodriguez'
    },
    {
      email: 'tech@techservices.com',
      password: 'Tecnico123!@#',
      name: 'Ana Garcia'
    }
  ]

  for (const userData of users) {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        }
      })
      
      console.log(`✅ Created user: ${userData.email}`)
    } catch (error) {
      console.log(`⚠️  User ${userData.email} may already exist or error occurred:`, error)
    }
  }

  console.log('🎉 Demo users creation completed!')
}

createDemoUsers().catch(console.error)