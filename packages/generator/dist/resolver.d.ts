export declare const DependencyVersions: Record<string, string>;
export declare class VersionResolver {
    static resolve(target: 'react-native' | 'flutter', packages: string[]): Record<string, string>;
}
