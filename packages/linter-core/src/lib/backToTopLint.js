/**
 * Generates an anchor slug from the first heading found in the Markdown.
 * If no heading is found, returns "top".
 */
function generateAnchorFromFirstHeading(markdown) {
    const lines = markdown.split("\n");
    for (const line of lines) {
      const match = line.match(/^#{1,6}\s+(.*)/);
      if (match && match[1]) {
        const heading = match[1].trim();
        return heading.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      }
    }
    return "top";
  }
  
  /**
   * Generates the Back-to-Top link using the first heading as the target anchor.
   * If no heading is present, the default anchor "top" is returned.
   */
  function generateBackToTopLink(markdown, ruleConfig = {}) {
    const targetAnchor = generateAnchorFromFirstHeading(markdown);
    const linkText = (ruleConfig.link_texts && ruleConfig.link_texts[0]) || "Back to Top";
    return `[${linkText}](#${targetAnchor})`;
  }
  
  /**
   * Checks if a Back-to-Top link is present in the AST.
   * (This simplistic check scans link nodes and compares their text.)
   */
  export function hasBackToTopLink(ast, ruleConfig = {}) {
    const accepted = (ruleConfig.link_texts || ["back to top"]).map(t => t.toLowerCase());
    let found = false;
    
    // Use unist-util-visit if available; here we assume ast.children is an array.
    ast.children.forEach(node => {
      if (node.type === 'link') {
        const text = (node.children || [])
          .map(child => child.value || "")
          .join("")
          .toLowerCase();
        if (accepted.includes(text)) {
          found = true;
        }
      }
    });
    
    return found;
  }
  
  /**
   * Inserts a Back-to-Top link into the Markdown content.
   * - In "bottom" mode, it appends the link at the end.
   * - In "after_each_section" mode, it inserts the link after each heading (level 2+).
   *
   * Additionally, if no heading is found (i.e. anchor is "top"), it prepends a default "# Top" header.
   */
  export function addBackToTopLink(markdown, ruleConfig = {}) {
    const link = generateBackToTopLink(markdown, ruleConfig);
    const mode = ruleConfig.mode || "bottom";
  
    let modifiedMarkdown = markdown.trimEnd();
  
    // Insert "# Top" if needed and not present
    const targetAnchor = generateAnchorFromFirstHeading(modifiedMarkdown);
    if (targetAnchor === "top" && !/^#\s+Top\b/i.test(modifiedMarkdown)) {
      modifiedMarkdown = `# Top\n\n${modifiedMarkdown}`;
    }
  
    if (mode === "after_each_section") {
      const lines = modifiedMarkdown.split("\n");
      const modifiedLines = [];
      let foundHeading = false;
  
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        modifiedLines.push(line);
  
        if (/^#{2,6}\s+/.test(line)) {
          foundHeading = true;
          modifiedLines.push(link);
        }
      }
  
      // Fallback: No headings? Just append once at the end
      if (!foundHeading) {
        modifiedLines.push("", link);
      }
  
      return modifiedLines.join("\n");
    }
  
    // Default fallback (bottom)
    return `${modifiedMarkdown}\n\n${link}`;
  }  