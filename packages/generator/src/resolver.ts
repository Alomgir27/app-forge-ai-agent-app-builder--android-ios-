export const DependencyVersions: Record<string, string> = {
    "react": "18.2.0",
    "react-native": "0.72.6",
    "expo": "~49.0.15",
    "expo-status-bar": "~1.6.0",
    "@expo/vector-icons": "^13.0.0",
    "flutter": "3.16.0",
    "cupertino_icons": "^1.0.2"
};

export class VersionResolver {
    static resolve(target: 'react-native' | 'flutter', packages: string[]): Record<string, string> {
        const dependencies: Record<string, string> = {};

        // Core dependencies
        if (target === 'react-native') {
            dependencies['react'] = DependencyVersions['react'];
            dependencies['react-native'] = DependencyVersions['react-native'];
            dependencies['expo'] = DependencyVersions['expo'];
            dependencies['expo-status-bar'] = DependencyVersions['expo-status-bar'];
        } else if (target === 'flutter') {
            dependencies['flutter'] = `sdk: flutter`;
            dependencies['cupertino_icons'] = DependencyVersions['cupertino_icons'];
        }

        // Add requested packages
        packages.forEach(pkg => {
            if (DependencyVersions[pkg]) {
                dependencies[pkg] = DependencyVersions[pkg];
            } else {
                console.warn(`Version for package ${pkg} not found in registry, using 'latest'`);
                dependencies[pkg] = 'latest';
            }
        });

        return dependencies;
    }
}
