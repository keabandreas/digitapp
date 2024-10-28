import { NextResponse } from 'next/server'
import { getDocuments, getDocument, createDocument, updateDocument, toggleDocumentRestriction } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const includeRestricted = searchParams.get('includeRestricted') === 'true'

  if (id) {
    const document = await getDocument(parseInt(id), includeRestricted)
    return NextResponse.json(document)
  } else {
    const documents = await getDocuments(includeRestricted)
    return NextResponse.json(documents)
  }
}

export async function POST(request: Request) {
  const { title, content, restricted } = await request.json()
  const result = await createDocument(title, content, restricted)
  return NextResponse.json(result)
}

export async function PUT(request: Request) {
  const { id, title, content, restricted } = await request.json()
  const result = await updateDocument(id, title, content, restricted)
  return NextResponse.json(result)
}

export async function PATCH(request: Request) {
  const { id } = await request.json()
  const result = await toggleDocumentRestriction(id)
  return NextResponse.json(result)
}
