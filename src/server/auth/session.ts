import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

export const getServerAuthSession = () => getServerSession(authOptions);
