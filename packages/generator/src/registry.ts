export const ComponentRegistry: Record<string, any> = {
    Container: {
        reactNative: (props: any, children: string) => `<View style={{padding: ${props.padding || 0}}}>${children}</View>`,
        flutter: (props: any, children: string) => `Padding(padding: EdgeInsets.all(${props.padding || 0}.0), child: Column(children: [${children}]))`
    },
    Text: {
        reactNative: (props: any) => `<Text>${props.text || ''}</Text>`,
        flutter: (props: any) => `Text("${props.text || ''}")`
    },
    Button: {
        reactNative: (props: any) => `<Button title="${props.label || 'Button'}" onPress={() => {}} />`,
        flutter: (props: any) => `ElevatedButton(onPressed: () {}, child: Text("${props.label || 'Button'}"))`
    }
};
