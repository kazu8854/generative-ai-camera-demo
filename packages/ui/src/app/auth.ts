import { fetchAuthSession } from "aws-amplify/auth";

// //idTokenを取得
export const fetchAuth = async(
    endpoint: string,
    init: RequestInit = {}
    ) : Promise<Response> => {
        
    const token = (await fetchAuthSession()).tokens?.idToken?.toString();
    if (!init.headers) init.headers = {}
    const headers = new Headers(init.headers);
    if (token) {
        headers.set('Authorization', token);
    }

    const result = await fetch(endpoint, {
        ...init,
        headers
    })

    return result
}
