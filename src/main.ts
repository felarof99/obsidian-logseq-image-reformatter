import { App, Editor, MarkdownView, Notice, Plugin, TFile, TAbstractFile } from 'obsidian';
import { LogseqImageReformatterSettingsTab } from './settings';

// Simple RegExp to match Obsidian-style image links: ![[image.png]]
const OBSIDIAN_IMAGE_REGEX: RegExp = /!\[\[(.*?)\]\]/g;

// List of common image extensions to check
const IMAGE_EXTS = [
	'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg',
];

interface PluginSettings {
	// Keeping minimal settings for future extensibility
	outputPath: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	outputPath: '../assets'
};

export default class LogseqImageReformatterPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		// Add a single command to reformat images
		this.addCommand({
			id: "reformat-images",
			name: "Reformat Images for Logseq",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				await this.reformatImagesInMarkdown(editor, view);
			}
		});

		// Add settings tab
		this.addSettingTab(new LogseqImageReformatterSettingsTab(this.app, this));
	}

	onunload() {
		// No cleanup needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Reformats the given markdown content, converting Obsidian-style image links to standard Markdown
	 * @param content - The markdown content to reformat
	 * @param outputPath - The path where images will be referenced from
	 * @returns An object containing the modified content and count of replacements
	 */
	reformatMarkdownContent(content: string, outputPath: string): { content: string, count: number } {
		let modifiedContent = content;
		let count = 0;

		// Find all Obsidian image links and convert them
		const matches = content.matchAll(OBSIDIAN_IMAGE_REGEX);
		for (const match of matches) {
			const originalLink = match[0]; // The full match: ![[image.png]]
			const imageName = match[1]; // Just the image name: image.png
			
			// Skip if not an image
			if (!this.isImage(imageName)) continue;
			
			// Create the new link in standard Markdown format with the specified path
			// Add angle brackets around the path for better compatibility with spaces in filenames
			const newLink = `![image](<${outputPath}/${imageName}>)`;
			
			// Replace in the content
			modifiedContent = modifiedContent.replace(originalLink, newLink);
			count++;
		}

		return { content: modifiedContent, count };
	}

	/**
	 * Reformats all images in the current markdown file from Obsidian format to standard Markdown
	 */
	async reformatImagesInMarkdown(editor: Editor, view: MarkdownView) {
		const mdFile = view.file;
		if (!mdFile) return;

		const fileContent = editor.getValue();
		
		// Use the extracted function for reformatting
		const { content: modifiedContent, count } = this.reformatMarkdownContent(fileContent, this.settings.outputPath);

		// Update the editor with the new content if changes were made
		if (count > 0) {
			editor.setValue(modifiedContent);
			new Notice(`Reformatted ${count} image(s) for Logseq compatibility`);
		} else {
			new Notice("No Obsidian-format images found to convert");
		}
	}

	/**
	 * Checks if a file has an image extension
	 */
	isImage(filename: string): boolean {
		const ext = filename.split('.').pop()?.toLowerCase();
		return ext ? IMAGE_EXTS.includes(ext) : false;
	}
}