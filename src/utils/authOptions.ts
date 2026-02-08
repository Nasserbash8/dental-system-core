import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/utils/dbConnect";
import Patient from "@/models/patients";

// Extending the default User interface to include custom patient fields
interface ExtendedUser extends User {
  id: string;
  code: string;
  patientId: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        await dbConnect();

        // Search for the patient using the unique access code
        const patient = await Patient.findOne({ code: credentials?.code });

        if (!patient) return null;

        const user: ExtendedUser = {
          id: patient.patientId,
          code: patient.code,
          patientId: patient.patientId,
        };

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Persist the patientId to the token
        token.patientId = (user as ExtendedUser).patientId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.patientId) {
        // Make patientId available in the session object on the client side
        session.user.id = token.patientId as string;
      }
      return session;
    }
  }
};