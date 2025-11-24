"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionResolver = exports.DependencyVersions = void 0;
exports.DependencyVersions = {
    "react": "18.2.0",
    "react-native": "0.72.6",
    "expo": "~49.0.15",
    "expo-status-bar": "~1.6.0",
    "@expo/vector-icons": "^13.0.0",
    "flutter": "3.16.0",
    "cupertino_icons": "^1.0.2"
};
class VersionResolver {
    static resolve(target, packages) {
        const dependencies = {};
        // Core dependencies
        if (target === 'react-native') {
            dependencies['react'] = exports.DependencyVersions['react'];
            dependencies['react-native'] = exports.DependencyVersions['react-native'];
            dependencies['expo'] = exports.DependencyVersions['expo'];
            dependencies['expo-status-bar'] = exports.DependencyVersions['expo-status-bar'];
        }
        else if (target === 'flutter') {
            dependencies['flutter'] = `sdk: flutter`;
            dependencies['cupertino_icons'] = exports.DependencyVersions['cupertino_icons'];
        }
        // Add requested packages
        packages.forEach(pkg => {
            if (exports.DependencyVersions[pkg]) {
                dependencies[pkg] = exports.DependencyVersions[pkg];
            }
            else {
                console.warn(`Version for package ${pkg} not found in registry, using 'latest'`);
                dependencies[pkg] = 'latest';
            }
        });
        return dependencies;
    }
}
exports.VersionResolver = VersionResolver;
