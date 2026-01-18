import CredentialsProvider from "next-auth/providers/credentials";
import {compare} from "bcryptjs";
import {prisma } from "./prisma";


export const authOptions = {
    session:{
        strategy: 'jwt',
    },

    providers:[
        CredentialsProvider({
            name: 'Credentials',

            credentials:{
                email:{label:"Email",type:"text"},
                password:{label:"Password",type:"password"},
            },

            async authorize(credentials){
                // check if email and password is provided
                if(!credentials?.email || !credentials?.password){
                    throw new Error("Email and Password required");
                }
                
                const user = await prisma.user.findUnique({
                    where:{email: credentials.email},
                });

                if(!user){
                    throw new Error("No user found with the given email");
                }

                const isPasswordCorrect = await compare(
                    credentials.password,
                    user.password
                );

                if(!isPasswordCorrect){
                    throw new Error("Incorrect password");
                }

                return {id: user.id, email: user.email, name: user.name, role: user.role};
                
            }
        })
    ],
                callbacks:{
                    async jwt({token, user}){
                        if(user){
                            token.id = user.id;
                            token.role = user.role;
                        }   
                        return token;
                    },
                    async session({session, token}){
                        if(session.user){
                            session.user.id = token.id;
                            session.user.role = token.role;
                        }
                        return session;
                    }
                },

                pages:{
                    signIn: '/login',
                }
}


