import path from 'path';
import * as vscode from 'vscode';

export class DfEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new DfEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(DfEditorProvider.viewType, provider);
        return providerRegistration;
    }

    private static readonly viewType = 'dfeditor.dfeditor';

    constructor(
        private readonly context: vscode.ExtensionContext
    ) { }

    public async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true
        }

        const webviewScriptUri = webviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, "dist", "webview.js")))
        const litegraphCss = webviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, "media", "litegraph.css")))
        const vanillaDatapackUri = webviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, "media", "vanilla_datapack_1_18_2.zip")))

        console.log(vanillaDatapackUri)
        const nonce = DfEditorProvider.getNonce();

        webviewPanel.webview.html =
            `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<!--<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webviewPanel.webview.cspSource}; img-src ${webviewPanel.webview.cspSource} https:; script-src 'nonce-${nonce}';">-->
				<link rel="stylesheet" type="text/css" href="${litegraphCss}">
				<title>Density Function Editor</title>
			</head>
			<body style="width: 100vw; height: 100vh; padding: 0; margin: 0;">
				<canvas style="padding: 0; margin: 0; width: 100%; height: 100%;" id='mycanvas'></canvas>
				<script nonce="${nonce}">vanillaDatapackUrl = "${vanillaDatapackUri}"</script>
				<script nonce="${nonce}" src="${webviewScriptUri}"></script>
			</body>
			</html>`;
    }

    private static getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

}