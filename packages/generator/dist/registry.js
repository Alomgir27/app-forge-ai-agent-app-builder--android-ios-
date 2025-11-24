"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentRegistry = void 0;
exports.ComponentRegistry = {
    Container: {
        reactNative: (props, children) => `<View style={{padding: ${props.padding || 0}}}>${children}</View>`,
        flutter: (props, children) => `Padding(padding: EdgeInsets.all(${props.padding || 0}.0), child: Column(children: [${children}]))`
    },
    Text: {
        reactNative: (props) => `<Text>${props.text || ''}</Text>`,
        flutter: (props) => `Text("${props.text || ''}")`
    },
    Button: {
        reactNative: (props) => `<Button title="${props.label || 'Button'}" onPress={() => {}} />`,
        flutter: (props) => `ElevatedButton(onPressed: () {}, child: Text("${props.label || 'Button'}"))`
    }
};
