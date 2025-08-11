import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
 
  try {
   const session = requireAuth(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


// export async function POST(request: NextRequest) {
//   try {
//     const unauthorized = requireAuth(request);
    
//     if (!unauthorized) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const body = await request.json()
//     const { email, name, password, role } = body

//     if (!email || !password || !role) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
//     }

//     // Validate role
//     const validRoles = Object.values(USER_ROLES)
//     if (!validRoles.includes(role)) {
//       return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
//     }

//     // Check if user already exists
//     const existingUser = await prisma.user.findUnique({
//       where: { email }
//     })

//     if (existingUser) {
//       return NextResponse.json({ error: 'User already exists' }, { status: 409 })
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12)

//     // Create user
//     const user = await prisma.user.create({
//       data: {
//         email,
//         name,
//         password: hashedPassword,
//         role
//       },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         createdAt: true,
//         updatedAt: true
//       }
//     })

//     // Create audit log
//     await prisma.auditLog.create({
//       data: {
//         action: 'CREATE',
//         entity: 'User',
//         entityId: user.id,
//         newData: { email, name, role },
//         userId: session.user.id
//       }
//     })

//     return NextResponse.json(user, { status: 201 })
//   } catch (error) {
//     console.error('Error creating user:', error)
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
//   }
// }
