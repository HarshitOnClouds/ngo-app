import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function requireAuth(){
    const session = await getServerSession(authOptions);

    if(!session || !session.user){
        throw new Error("UNAUTHORIZED");
    }

    return session;
}


export async function requireOwner(){
    const session = await requireAuth();

    if(session.user.role !== "OWNER"){
        throw new Error("FORBIDDEN");
    }
    return session;
}

export async function requireAdminOrOwner(){
    const session = await requireAuth();

    if(session.user.role !== "ADMIN" && session.user.role !== "OWNER"){
        throw new Error("FORBIDDEN");
    }
    return session;
}

export async function requireMember(){
    const session = await requireAuth();
    if(session.user.role !== "MEMBER"){
        throw new Error("FORBIDDEN");
    }
    return session;
}