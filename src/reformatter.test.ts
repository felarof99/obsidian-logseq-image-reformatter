import { describe, it, expect } from 'vitest';

// Test utilities
const IMAGE_EXTS = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg',
];

// Simple RegExp to match Obsidian-style image links: ![[image.png]]
const OBSIDIAN_IMAGE_REGEX: RegExp = /!\[\[(.*?)\]\]/g;

/**
 * Checks if a file has an image extension
 */
function isImage(filename: string): boolean {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? IMAGE_EXTS.includes(ext) : false;
}

/**
 * Reformats the given markdown content, converting Obsidian-style image links to standard Markdown
 */
function reformatMarkdownContent(content: string, outputPath: string): { content: string, count: number } {
    let modifiedContent = content;
    let count = 0;

    // Find all Obsidian image links and convert them
    const matches = content.matchAll(OBSIDIAN_IMAGE_REGEX);
    for (const match of matches) {
        const originalLink = match[0]; // The full match: ![[image.png]]
        const imageName = match[1]; // Just the image name: image.png
        
        // Skip if not an image
        if (!isImage(imageName)) continue;
        
        // Create the new link in standard Markdown format with the specified path
        // Add angle brackets around the path for better compatibility with spaces in filenames
        const newLink = `![image](<${outputPath}/${imageName}>)`;
        
        // Replace in the content
        modifiedContent = modifiedContent.replace(originalLink, newLink);
        count++;
    }

    return { content: modifiedContent, count };
}

describe('Image Reformatter', () => {
    const outputPath = '../assets';

    it('should reformat a basic image link', () => {
        const input = 'Here is an image: ![[image.png]]';
        const expected = `Here is an image: ![image](<${outputPath}/image.png>)`;
        
        const result = reformatMarkdownContent(input, outputPath);
        expect(result.content).toEqual(expected);
        expect(result.count).toEqual(1);
    });

    it('should reformat multiple images', () => {
        const input = 'Image 1: ![[img1.jpg]]\nImage 2: ![[img2.png]]';
        const expected = `Image 1: ![image](<${outputPath}/img1.jpg>)\nImage 2: ![image](<${outputPath}/img2.png>)`;
        
        const result = reformatMarkdownContent(input, outputPath);
        expect(result.content).toEqual(expected);
        expect(result.count).toEqual(2);
    });

    it('should handle various image types', () => {
        const input = '![[photo.jpg]] ![[icon.png]] ![[animation.gif]] ![[vector.svg]] ![[bitmap.bmp]]';
        const expected = `![image](<${outputPath}/photo.jpg>) ![image](<${outputPath}/icon.png>) ![image](<${outputPath}/animation.gif>) ![image](<${outputPath}/vector.svg>) ![image](<${outputPath}/bitmap.bmp>)`;
        
        const result = reformatMarkdownContent(input, outputPath);
        expect(result.content).toEqual(expected);
        expect(result.count).toEqual(5);
    });

    it('should ignore non-image files', () => {
        const input = 'Image: ![[photo.jpg]] Document: ![[document.pdf]]';
        const expected = `Image: ![image](<${outputPath}/photo.jpg>) Document: ![[document.pdf]]`;
        
        const result = reformatMarkdownContent(input, outputPath);
        expect(result.content).toEqual(expected);
        expect(result.count).toEqual(1);
    });

    it('should handle mixed content', () => {
        const input = '# Heading\n\nNormal text with ![[image.png]] embedded.\n\n- List item with ![[photo.jpg]]\n- Another item';
        const expected = `# Heading\n\nNormal text with ![image](<${outputPath}/image.png>) embedded.\n\n- List item with ![image](<${outputPath}/photo.jpg>)\n- Another item`;
        
        const result = reformatMarkdownContent(input, outputPath);
        expect(result.content).toEqual(expected);
        expect(result.count).toEqual(2);
    });

    it('should handle links and other markdown', () => {
        const input = '[External link](https://example.com) and ![[image.jpg]] and **bold text**';
        const expected = `[External link](https://example.com) and ![image](<${outputPath}/image.jpg>) and **bold text**`;
        
        const result = reformatMarkdownContent(input, outputPath);
        expect(result.content).toEqual(expected);
        expect(result.count).toEqual(1);
    });

    it('should not modify content without images', () => {
        const input = 'Just plain text with no images.';
        const expected = 'Just plain text with no images.';
        
        const result = reformatMarkdownContent(input, outputPath);
        expect(result.content).toEqual(expected);
        expect(result.count).toEqual(0);
    });

    it('should handle images with spaces in names', () => {
        const input = '![[my image.jpg]] and ![[photo with spaces.png]]';
        const expected = `![image](<${outputPath}/my image.jpg>) and ![image](<${outputPath}/photo with spaces.png>)`;
        
        const result = reformatMarkdownContent(input, outputPath);
        expect(result.content).toEqual(expected);
        expect(result.count).toEqual(2);
    });
}); 