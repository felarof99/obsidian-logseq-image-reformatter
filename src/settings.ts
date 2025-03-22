import { App, PluginSettingTab, Setting } from "obsidian";
import LogseqImageReformatterPlugin from "./main";

export class LogseqImageReformatterSettingsTab extends PluginSettingTab {
  plugin: LogseqImageReformatterPlugin;
  
  constructor(app: App, plugin: LogseqImageReformatterPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    this.containerEl.empty();

    this.containerEl.createEl("h1", { text: "Logseq Image Reformatter Settings" });
    
    new Setting(this.containerEl)
      .setName("Output Path")
      .setDesc("Path where the reformatted images will be referenced from (e.g., '../assets', './images')")
      .addText(text => text
        .setPlaceholder("../assets")
        .setValue(this.plugin.settings.outputPath)
        .onChange(async (value) => {
          this.plugin.settings.outputPath = value;
          await this.plugin.saveSettings();
        }));
  }
}