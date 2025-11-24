import { AppSchema } from '@lowcode/schema';
interface PuckNode {
    type: string;
    props: any;
}
interface PuckData {
    content: PuckNode[];
    root: any;
}
interface GeneratedFile {
    path: string;
    content: string;
}
export declare const generateCode: (data: PuckData, appConfig: AppSchema["appConfig"], target: "react-native" | "flutter") => GeneratedFile[];
export {};
