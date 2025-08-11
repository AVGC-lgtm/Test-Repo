
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';


export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const company = searchParams.get('company')
    const name = searchParams.get('name')

    const where: any = {}
    
    if (category) {
      where.category = category
    }
    
    if (company) {
      where.company = {
        contains: company,
        mode: 'insensitive'
      }
    }

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive'
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        scanResults: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Latest 5 scan results
        }
      },
      orderBy: [
        { category: 'asc' },
        { company: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      category, 
      company, 
      name, 
      activeIngredient, 
      composition, 
      packaging, 
      batchFormat, 
      commonCounterfeitMarkers, 
      mrp, 
      hologramFeatures, 
      bagColor, 
      subsidizedRate, 
      varieties 
    } = body

    if (!category || !company || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if product already exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        category_company_name: {
          category,
          company,
          name
        }
      }
    })

    if (existingProduct) {
      return NextResponse.json({ error: 'Product already exists' }, { status: 409 })
    }

    const product = await prisma.product.create({
      data: {
        category,
        company,
        name,
        activeIngredient,
        composition,
        packaging: packaging || [],
        batchFormat,
        commonCounterfeitMarkers: commonCounterfeitMarkers || [],
        mrp,
        hologramFeatures: hologramFeatures || [],
        bagColor,
        subsidizedRate,
        varieties: varieties || []
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Product',
        entityId: product.id,
        newData: body,
        userId: session.user.id
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
