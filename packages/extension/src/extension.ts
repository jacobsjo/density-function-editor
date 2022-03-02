import { CompositeDatapack, ZipDatapack } from 'mc-datapack-loader';
import * as vscode from 'vscode';
import { DfEditorProvider } from './DfEditorProvider';


export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(DfEditorProvider.register(context))
}

// this method is called when your extension is deactivated
export function deactivate() { }


