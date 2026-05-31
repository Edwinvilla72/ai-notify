import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { output } from 'framer-motion/client';


export function activate(context: vscode.ExtensionContext) {

    // Create a VS Code Output Channel (to view log stream for this extension)
    const outputChannel = vscode.window.createOutputChannel("AI-Notify");
    // the idea with this part is that appending the line displays logs to this output channel
    outputChannel.appendLine("[AI-NOTIFY] - THIS IS A TEST");
    outputChannel.show;



    function getConfig() {
        return vscode.workspace.getConfiguration('ai-notify');
    }

    function getSoundPath(): string {
        const custom = getConfig().get<string>('soundFile') ?? '';
        if (custom && fs.existsSync(custom)) { return custom; }
        return path.join(context.extensionPath, 'assets', 'notification.mp3');
    }

    // plays the sound on the user's device
    function playSound() {
        // check if sound exists at the defined path
        const soundPath = getSoundPath();
        if (!fs.existsSync(soundPath)) {
            vscode.window.showErrorMessage("Could not find sound effect in filepath: ", soundPath);
        }

        outputChannel.appendLine("[AI-NOTIFY] - Playing sound\n");
        // set command and execute depending on hardware
        let command: string;

        switch (process.platform) {
            // windows
            case 'win32':
                outputChannel.appendLine("[AI-NOTIFY] - entered windows command!\n");
                command = `powershell -c "Add-Type -AssemblyName presentationCore; $mp = New-Object System.Windows.Media.MediaPlayer; $mp.Open('${soundPath}'); $mp.Play(); Start-Sleep -s 3"`;
                break;
            // apple/linux
            case 'darwin':
                command = `afplay "${soundPath}"`;
                break;

            default:
                command = `mpg123 "${soundPath}" >/dev/null 2>&1 || ffplay -nodisp -autoexit "${soundPath}" >/dev/null 2>&1`;
                break;
        }

        // execute the command
        exec(command, (error) => {
            if (error) { outputChannel.appendLine(`[AI-NOTIFY] - ERROR: Could not play sound - ${error.message}`); };
        });

    }

    // monitor codex logs
    function watchCodexLogs() {
        // 
    }

    const disposable = vscode.commands.registerCommand('ai-notify', () => {

        // The code you place here will be executed every time your command is executed
        // Display a message box to the user and play a sound
        playSound();
        vscode.window.showInformationMessage('Hi! You should have heard a sound!');
    });

    context.subscriptions.push(disposable);

}

export function deactivate() { };