// Since stateless JWT, client should just delete token.
export async function POST() {
  return new Response(null, { status: 200 });
}
