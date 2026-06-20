import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

/** Turns Draft Mode off and returns to the site root. */
export async function GET(request: Request) {
  const draft = await draftMode()
  draft.disable()
  return NextResponse.redirect(new URL('/', request.url))
}
