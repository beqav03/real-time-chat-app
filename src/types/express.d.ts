declare module 'express' {
    interface Request {
        headers: any;
        user?: { 
            id: number,
            email: string,
            role: string
        };
    }
}
