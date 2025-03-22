var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/test.ts
var test_exports = {};
__export(test_exports, {
  runTests: () => runTests
});
module.exports = __toCommonJS(test_exports);

// src/main.ts
var import_obsidian2 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var LogseqImageReformatterSettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    this.containerEl.empty();
    this.containerEl.createEl("h1", { text: "Logseq Image Reformatter Settings" });
    new import_obsidian.Setting(this.containerEl).setName("Output Path").setDesc("Path where the reformatted images will be referenced from (e.g., '../assets', './images')").addText((text) => text.setPlaceholder("../assets").setValue(this.plugin.settings.outputPath).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.outputPath = value;
      yield this.plugin.saveSettings();
    })));
  }
};

// src/main.ts
var OBSIDIAN_IMAGE_REGEX = /!\[\[(.*?)\]\]/g;
var IMAGE_EXTS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "svg"
];
var DEFAULT_SETTINGS = {
  outputPath: "../assets"
};
var LogseqImageReformatterPlugin = class extends import_obsidian2.Plugin {
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      this.addCommand({
        id: "reformat-images",
        name: "Reformat Images for Logseq",
        editorCallback: (editor, view) => __async(this, null, function* () {
          yield this.reformatImagesInMarkdown(editor, view);
        })
      });
      this.addSettingTab(new LogseqImageReformatterSettingsTab(this.app, this));
    });
  }
  onunload() {
  }
  loadSettings() {
    return __async(this, null, function* () {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
    });
  }
  /**
   * Reformats the given markdown content, converting Obsidian-style image links to standard Markdown
   * @param content - The markdown content to reformat
   * @param outputPath - The path where images will be referenced from
   * @returns An object containing the modified content and count of replacements
   */
  reformatMarkdownContent(content, outputPath) {
    let modifiedContent = content;
    let count = 0;
    const matches = content.matchAll(OBSIDIAN_IMAGE_REGEX);
    for (const match of matches) {
      const originalLink = match[0];
      const imageName = match[1];
      if (!this.isImage(imageName))
        continue;
      const newLink = `![image](${outputPath}/${imageName})`;
      modifiedContent = modifiedContent.replace(originalLink, newLink);
      count++;
    }
    return { content: modifiedContent, count };
  }
  /**
   * Reformats all images in the current markdown file from Obsidian format to standard Markdown
   */
  reformatImagesInMarkdown(editor, view) {
    return __async(this, null, function* () {
      const mdFile = view.file;
      if (!mdFile)
        return;
      const fileContent = editor.getValue();
      const { content: modifiedContent, count } = this.reformatMarkdownContent(fileContent, this.settings.outputPath);
      if (count > 0) {
        editor.setValue(modifiedContent);
        new import_obsidian2.Notice(`Reformatted ${count} image(s) for Logseq compatibility`);
      } else {
        new import_obsidian2.Notice("No Obsidian-format images found to convert");
      }
    });
  }
  /**
   * Checks if a file has an image extension
   */
  isImage(filename) {
    var _a;
    const ext = (_a = filename.split(".").pop()) == null ? void 0 : _a.toLowerCase();
    return ext ? IMAGE_EXTS.includes(ext) : false;
  }
};

// src/test.ts
function runTests() {
  const plugin = new LogseqImageReformatterPlugin(null, null);
  const outputPath = "../assets";
  const testCases = [
    {
      name: "Basic image reformatting",
      input: "Here is an image: ![[image.png]]",
      expected: `Here is an image: ![image](${outputPath}/image.png)`
    },
    {
      name: "Multiple images",
      input: "Image 1: ![[img1.jpg]]\nImage 2: ![[img2.png]]",
      expected: `Image 1: ![image](${outputPath}/img1.jpg)
Image 2: ![image](${outputPath}/img2.png)`
    },
    {
      name: "Various image types",
      input: "![[photo.jpg]] ![[icon.png]] ![[animation.gif]] ![[vector.svg]] ![[bitmap.bmp]]",
      expected: `![image](${outputPath}/photo.jpg) ![image](${outputPath}/icon.png) ![image](${outputPath}/animation.gif) ![image](${outputPath}/vector.svg) ![image](${outputPath}/bitmap.bmp)`
    },
    {
      name: "Non-image files ignored",
      input: "Image: ![[photo.jpg]] Document: ![[document.pdf]]",
      expected: `Image: ![image](${outputPath}/photo.jpg) Document: ![[document.pdf]]`
    },
    {
      name: "Mixed content",
      input: "# Heading\n\nNormal text with ![[image.png]] embedded.\n\n- List item with ![[photo.jpg]]\n- Another item\n\n```code\n![[should.not.change.png]]\n```",
      expected: `# Heading

Normal text with ![image](${outputPath}/image.png) embedded.

- List item with ![image](${outputPath}/photo.jpg)
- Another item

\`\`\`code
![[should.not.change.png]]
\`\`\``
    },
    {
      name: "Links and other markdown",
      input: "[External link](https://example.com) and ![[image.jpg]] and **bold text**",
      expected: `[External link](https://example.com) and ![image](${outputPath}/image.jpg) and **bold text**`
    },
    {
      name: "No images",
      input: "Just plain text with no images.",
      expected: "Just plain text with no images."
    },
    {
      name: "Images with spaces in names",
      input: "![[my image.jpg]] and ![[photo with spaces.png]]",
      expected: `![image](${outputPath}/my image.jpg) and ![image](${outputPath}/photo with spaces.png)`
    }
  ];
  console.log("Running image reformatter tests:");
  console.log("-------------------------------");
  let passedCount = 0;
  for (const test of testCases) {
    const result = plugin.reformatMarkdownContent(test.input, outputPath);
    const passed = result.content === test.expected;
    console.log(`Test: ${test.name}`);
    console.log(`  - ${passed ? "PASSED \u2713" : "FAILED \u2717"}`);
    if (!passed) {
      console.log("  - Expected: ", test.expected);
      console.log("  - Actual:   ", result.content);
    }
    if (passed)
      passedCount++;
  }
  console.log("-------------------------------");
  console.log(`Tests complete: ${passedCount}/${testCases.length} passed`);
}
if (require.main === module) {
  runTests();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  runTests
});
