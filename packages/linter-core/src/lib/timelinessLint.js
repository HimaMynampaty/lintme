/**
 * Check if README mentions End of Support information
 * @param {string} markdown
 * @returns {{
*   message: string,
*   found: boolean,
*   diagnostics: Array<{ line: number, severity: string, message: string, suggestion?: string }>
* }}
*/
export function checkEndOfSupportMention(markdown) {
   const keywords = [
       "end of support",
       "EOL",
       "end-of-life",
       "support will end",
       "maintenance ends"
   ];

   const foundKeyword = keywords.find(kw =>
       markdown.toLowerCase().includes(kw.toLowerCase())
   );

   const lines = markdown.split("\n");
   let lineNum = 1;
   for (let i = 0; i < lines.length; i++) {
       if (foundKeyword && lines[i].toLowerCase().includes(foundKeyword)) {
           lineNum = i + 1;
           break;
       }
   }

   const found = Boolean(foundKeyword);
   const diagnostics = [];

   if (!found) {
       diagnostics.push({
           line: 1,
           severity: "warning",
           message: "End of support details are missing from the documentation.",
           suggestion: "Mention expected support timelines or 'end-of-life' details to inform users about maintenance or updates."
       });
   }

   return {
       message: found
           ? `End of support information found (mentions "${foundKeyword}").`
           : "No end-of-support information found in README.",
       found,
       diagnostics
   };
}
