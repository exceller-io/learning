import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sanityWriteClient } from '@/lib/sanity'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('avatar') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const asset = await sanityWriteClient.assets.upload('image', buffer, {
    filename: file.name,
    contentType: file.type,
  })

  await sanityWriteClient.createOrReplace({
    _type: 'userProfile',
    _id: `userProfile-${session.user.id}`,
    userId: session.user.id,
    displayName: session.user.name ?? undefined,
    avatar: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
    },
  })

  return NextResponse.json({ assetId: asset._id, url: asset.url })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await sanityWriteClient.fetch(
    `*[_type == "userProfile" && userId == $userId][0]{ userId, displayName, avatar }`,
    { userId: session.user.id }
  )

  return NextResponse.json(profile ?? null)
}
