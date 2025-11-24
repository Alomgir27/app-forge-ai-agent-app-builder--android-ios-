export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

export interface Project {
    id: string;
    name: string;
    owner_id: string;
    schema: any; // Will map to our Internal Schema
    created_at: string;
    updated_at: string;
}

export interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    schema: any;
    thumbnail_url?: string;
}
