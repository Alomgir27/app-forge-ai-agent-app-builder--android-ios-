import { ComponentRegistry } from './registry';
import { VersionResolver } from './resolver';
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

export const generateCode = (data: PuckData, appConfig: AppSchema['appConfig'], target: 'react-native' | 'flutter'): GeneratedFile[] => {
    const files: GeneratedFile[] = [];

    // 1. Generate Source Code
    const generateNode = (node: PuckNode): string => {
        const component = ComponentRegistry[node.type];
        if (!component) return '';

        const template = component[target === 'react-native' ? 'reactNative' : 'flutter'];
        if (!template) return '';

        let childrenCode = '';
        if (node.props.content && Array.isArray(node.props.content)) {
            childrenCode = node.props.content.map((child: PuckNode) => generateNode(child)).join('\n');
        }

        return template(node.props, childrenCode);
    };

    const componentCode = data.content.map(generateNode).join('\n');

    if (target === 'react-native') {
        // App.js
        files.push({
            path: 'App.js',
            content: `import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      ${componentCode}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});`
        });

        // package.json
        const dependencies = VersionResolver.resolve('react-native', []);
        files.push({
            path: 'package.json',
            content: JSON.stringify({
                name: appConfig.name.toLowerCase().replace(/\s+/g, '-'),
                version: appConfig.version,
                main: "node_modules/expo/AppEntry.js",
                scripts: {
                    "start": "expo start",
                    "android": "expo start --android",
                    "ios": "expo start --ios",
                    "web": "expo start --web"
                },
                dependencies: dependencies,
                devDependencies: {
                    "@babel/core": "^7.20.0"
                },
                private: true
            }, null, 2)
        });

        // app.json (Expo Config)
        files.push({
            path: 'app.json',
            content: JSON.stringify({
                expo: {
                    name: appConfig.name,
                    slug: appConfig.name.toLowerCase().replace(/\s+/g, '-'),
                    version: appConfig.version,
                    orientation: "portrait",
                    icon: "./assets/icon.png",
                    userInterfaceStyle: "light",
                    splash: {
                        image: "./assets/splash.png",
                        resizeMode: "contain",
                        backgroundColor: "#ffffff"
                    },
                    assetBundlePatterns: ["**/*"],
                    ios: {
                        supportsTablet: true
                    },
                    android: {
                        adaptiveIcon: {
                            foregroundImage: "./assets/adaptive-icon.png",
                            backgroundColor: "#ffffff"
                        }
                    },
                    web: {
                        favicon: "./assets/favicon.png"
                    }
                }
            }, null, 2)
        });

    } else {
        // Flutter main.dart
        files.push({
            path: 'lib/main.dart',
            content: `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${appConfig.name}',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: '${appConfig.name} Home Page'),
    );
  }
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({super.key, required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            ${componentCode}
          ],
        ),
      ),
    );
  }
}`
        });

        // pubspec.yaml
        const dependencies = VersionResolver.resolve('flutter', []);
        let depString = '';
        for (const [key, val] of Object.entries(dependencies)) {
            depString += `  ${key}: ${val}\n`;
        }

        files.push({
            path: 'pubspec.yaml',
            content: `name: ${appConfig.name.toLowerCase().replace(/\s+/g, '_')}
description: A new Flutter project.
publish_to: 'none'
version: ${appConfig.version}

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
${depString}

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
`
        });
    }

    return files;
};
