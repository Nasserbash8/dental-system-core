
import { User as NextAuthUser } from "next-auth";


declare module "next-auth" {
  interface User {
    id: string;       
    patientId: string; 
    code: string;      
  }

  interface Session {
    user: User;
  }
}
