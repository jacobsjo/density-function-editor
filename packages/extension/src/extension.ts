import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "df-editor" is now active!');

	let disposable = vscode.commands.registerCommand('df-editor.helloWorld', async () => {
		// Create and show a new webview
		const panel = vscode.window.createWebviewPanel(
			'catCoding', // Identifies the type of the webview. Used internally
			'Cat Coding', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{} // Webview options. More on these later.
		);

		panel.webview.options = {
			enableScripts: true
		}

		const webviewScriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "dist", "webview.js")))
		const litegraphCss = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "media", "litegraph.css")))
		const vanillaDatapackUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "media", "vanilla_datapack_1_18_2.zip")))

		console.log(vanillaDatapackUri)
		const nonce = getNonce();

		panel.webview.html = 
			`<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<!--<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource}; img-src ${panel.webview.cspSource} https:; script-src 'nonce-${nonce}';">-->
				<link rel="stylesheet" type="text/css" href="${litegraphCss}">
				<title>Density Function Editor</title>
			</head>
			<body style="width: 100vw; height: 100vh; padding: 0; margin: 0;">
				<canvas style="padding: 0; margin: 0; width: 100%; height: 100%;" id='mycanvas'></canvas>
				<script nonce="${nonce}">vanillaDatapackUrl = "${vanillaDatapackUri}"</script>
				<script nonce="${nonce}" src="${webviewScriptUri}"></script>
			</body>
			</html>`;

		console.log(webviewScriptUri)

	})
}

// this method is called when your extension is deactivated
export function deactivate() { }



function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}