import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from "@nestjs/common"

import { getAuth } from "../../lib/auth"; 

@Injectable()
 export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Initialize auth asynchronously
        const auth = await getAuth();

        const session = await auth.api.getSession({
            headers: request.headers,
        })

        if(!session) {
            throw new UnauthorizedException("Invalid Bearer Token")
        }

        request['user'] = session.user
        request['session'] = session.session

        return true;
    }
 }