import { CompositeDatapack, Datapack, ZipDatapack } from 'mc-datapack-loader';
import * as fs from 'fs';
import path from 'path';
import jszip from "jszip";
import * as vscode from 'vscode';
import { stringify } from 'comment-json';

export class DfEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new DfEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(DfEditorProvider.viewType, provider);
        return providerRegistration;
    }

    private static readonly viewType = 'dfeditor.dfeditor';
    private datapack: Promise<CompositeDatapack>

    private webviewPanel: vscode.WebviewPanel

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {

        this.datapack = new Promise<CompositeDatapack>(resolve => {
            jszip.loadAsync(fs.readFileSync(vscode.Uri.file(path.join(this.context.extensionPath, "media", "vanilla_datapack_1_18_2.zip")).path)).then(zip => {
                const vanillaDatapack = new ZipDatapack(zip as any)
                const datapack = new CompositeDatapack([vanillaDatapack])
                resolve(datapack)
            })
        })
    }

    public async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Promise<void> {
        this.webviewPanel = webviewPanel

        webviewPanel.webview.options = {
            enableScripts: true
        }

        webviewPanel.webview.onDidReceiveMessage(async (message: any) => {
            var result: any
            switch (message.command) {
                case "output-change":
                    const edit = new vscode.WorkspaceEdit();

                    edit.replace(
                        document.uri,
                        new vscode.Range(0, 0, document.lineCount, 0),
                        message.text
                    );
            
                    vscode.workspace.applyEdit(edit);
                    return;
                case "datapack-has":
                    result = await (await this.datapack).has(message.text.type, message.text.id)
                    break;
                case "datapack-getIds":
                    result = await (await this.datapack).getIds(message.text.type)
                    break;
                case "datapack-get":
                    result = await (await this.datapack).get(message.text.type, message.text.id)
                    break;
                case "datapack-save":
                    result = await (await this.datapack).save(message.text.type, message.text.id, message.text.data)
                    break;
                case "datapack-prepareSave":
                    result = await (await this.datapack).prepareSave()
                    break;
            }

            webviewPanel.webview.postMessage({ result: message.command, requestId: message.requestId, text: result })
        })

        vscode.workspace.onDidChangeTextDocument((e) => {
            webviewPanel.webview.postMessage({ command: "file-change", text: document.getText()})
        })

        const webviewScriptUri = webviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, "dist", "webview.js")))
        const litegraphCss = webviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, "media", "litegraph.css")))

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