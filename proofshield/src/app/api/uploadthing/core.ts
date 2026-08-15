import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { extractTextFromFile } from "@/lib/utils/extractText"
import { analyzeCredential } from "@/lib/ai/analyzer"
import { generateSalt, generateCommitment } from "@/lib/midnight/proofs"

const f = createUploadthing()

export const ourFileRouter = {
  credentialUploader: f({
    pdf: { maxFileSize: "4MB" },
    image: { maxFileSize: "4MB" },
  })
    .middleware(async () => {
      const session = await auth()
      if (!session || !session.user) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId)
      
      const credential = await prisma.credential.create({
        data: {
          userId: metadata.userId!,
          type: file.name.endsWith(".pdf") ? "CERTIFICATE" : "MANUAL_ENTRY",
          title: file.name,
          storageUrl: file.url,
          status: "PENDING",
        },
      })

      // Run async extraction & analysis
      ;(async () => {
        try {
          await prisma.credential.update({
            where: { id: credential.id },
            data: { status: "ANALYZING" },
          })

          const fileRes = await fetch(file.url)
          const fileBuffer = Buffer.from(await fileRes.arrayBuffer())

          const extractedText = await extractTextFromFile(
            fileBuffer,
            file.type,
            file.name
          )

          const claims = await analyzeCredential(extractedText)
          
          for (const claim of claims) {
            const salt = generateSalt()
            const commitment = generateCommitment(claim.value, salt)
            await prisma.claim.create({
              data: {
                userId: metadata.userId!,
                credentialId: credential.id,
                claimType: claim.claimType,
                subject: claim.subject,
                predicate: claim.predicate,
                value: claim.value,
                commitment: commitment,
                isPublic: true,
                verifiedByAI: true,
              },
            })
          }

          await prisma.credential.update({
            where: { id: credential.id },
            data: {
              status: "COMPLETE",
              analyzedAt: new Date(),
            },
          })
        } catch (err) {
          console.error("Async upload processing failed:", err)
          await prisma.credential.update({
            where: { id: credential.id },
            data: { status: "FAILED" },
          })
        }
      })()

      return { uploadedBy: metadata.userId, credentialId: credential.id }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
