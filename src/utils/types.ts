export type AuthFormData = {
    name? : string,
    email : string,
    password: string
}

export type ResponseData = {
    error?: string,
    status_code: number,
    message?: string,
    data?: object,
}

export type sessionData = {
    email: string,
    access_token: string
}