export interface AppConfig {
    name: string;
    version: string;
    collaborators: string[];
    theme: {
        primaryColor: string;
        [key: string]: any;
    };
}
export interface ComponentProps {
    [key: string]: any;
    responsive?: {
        mobile?: Record<string, any>;
        tablet?: Record<string, any>;
        desktop?: Record<string, any>;
    };
}
export interface ComponentNode {
    id: string;
    type: string;
    props: ComponentProps;
    children?: ComponentNode[];
}
export interface Page {
    id: string;
    name: string;
    route: string;
    components: ComponentNode[];
}
export interface Action {
    type: string;
    [key: string]: any;
}
export interface Workflow {
    id: string;
    trigger: string;
    actions: Action[];
}
export interface AppSchema {
    appConfig: AppConfig;
    pages: Page[];
    workflows: Workflow[];
}
