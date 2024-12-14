// // Function to add red underline without affecting text position
// function highlightMistakes(userText, modelText) {
//   let highlightedHTML = '';
//   const userWords = userText.split(' ');
//   const modelWords = modelText.split(' ');

//   for (let i = 0; i < userWords.length; i++) {
//     if (userWords[i] !== modelWords[i]) {
//       // Underline the word that is different
//       highlightedHTML += `<span class="highlight" data-suggestion="${modelWords[i]}" style="text-decoration: underline; color: transparent; border-bottom: 2px solid red;">${userWords[i]}</span> `;
//     } else {
//       // Keep the word as is
//       highlightedHTML += `${userWords[i]} `;
//     }
//   }

//   return highlightedHTML.trim();
// }

// // Function to check grammar and display suggestions
// async function checkGrammar(text) {
//   try {
//     const response = await fetch('http://localhost:5000/grammer_only', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ text })
//     });

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error connecting to the grammar model:', error);
//     return text; // Return the original text in case of an error
//   }
// }

// // Monitor all textareas for changes
// document.querySelectorAll('textarea, input[type="text"]').forEach(inputElement => {
//   inputElement.addEventListener('input', async (event) => {
//     const userText = event.target.value;

//     // Check if the last character is a space
//     if (userText.endsWith(' ')) {
//       if (userText.length > 2) {
//         const modelText = await checkGrammar(userText);
//         const highlightedHTML = highlightMistakes(userText, modelText);

//         // Create overlay div
//         let overlay = document.getElementById('highlight-overlay');
//         if (!overlay) {
//           overlay = document.createElement('div');
//           overlay.id = 'highlight-overlay';
//           overlay.style.position = 'absolute';
//           overlay.style.pointerEvents = 'none';
//           overlay.style.zIndex = '10';
//           overlay.style.whiteSpace = 'pre-wrap';
//           document.body.appendChild(overlay);
//         }

//         // Match styles to the input area
//         const style = window.getComputedStyle(inputElement);
//         overlay.style.fontSize = style.fontSize;
//         overlay.style.fontFamily = style.fontFamily;
//         overlay.style.lineHeight = style.lineHeight;
//         overlay.style.padding = style.padding;
//         overlay.style.direction = style.direction;
//         overlay.style.textAlign = style.textAlign;
        
//         // Position overlay
//         const rect = inputElement.getBoundingClientRect();
//         overlay.style.left = `${rect.left + window.scrollX}px`;
//         overlay.style.top = `${rect.top + window.scrollY}px`;
//         overlay.style.width = `${rect.width}px`;
//         overlay.style.height = `${rect.height}px`;

//         // Insert highlighted text into overlay
//         overlay.innerHTML = highlightedHTML;
//       }
//     }
//   });
// });

// // CSS styles for highlights
// const style = document.createElement('style');
// style.textContent = `
//   .highlight {
//     text-decoration: none;
//     color: transparent;
//     border-bottom: 2px solid red;
//   }
//   #highlight-overlay {
//     position: absolute;
//     overflow: hidden;
//     white-space: pre-wrap;
//     word-wrap: break-word;
//   }
// `;
// document.head.appendChild(style);


// Try 2 

// Log to confirm the script is loaded
// Log to confirm the script is loaded
console.log("Content script is running on this page.");

let typingTimer;
const typingDelay = 2000; // Delay in ms after user stops typing

// Function to send text to the grammar model
async function testGrammarCheck(text) {
  try {
    console.log("Sending text to grammar model:", text);
    const response = await fetch('http://localhost:5000/grammer_only', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      console.error("Response error:", response.statusText);
      return text;
    }

    const data = await response.json();
    console.log("Received response from grammar model:", data);
    return data;
  } catch (error) {
    console.error("Error connecting to the grammar model:", error);
    return text;
  }
}

// Function to display the suggestion box below the focused element
async function showSuggestionBox(userText, element) {
  const modelText = await testGrammarCheck(userText);

  if (userText !== modelText) {
    console.log("Suggestion found. Showing suggestion box.");
    createSuggestionBox(userText, modelText, element);
  } else {
    console.log("No suggestion found. Removing suggestion box.");
    removeSuggestionBox();
  }
}

// Create or update the "Did you mean" suggestion box fixed at the bottom
function createSuggestionBox(userText, suggestionText, element) {
  removeSuggestionBox();

  const box = document.createElement('div');
  box.id = 'suggestion-box';
  box.style.position = 'fixed';
  box.style.bottom = '20px';
  box.style.left = '50%';
  box.style.transform = 'translateX(-50%)';
  box.style.backgroundColor = '#f1f1f1';
  box.style.border = '1px solid #ccc';
  box.style.padding = '10px 15px';
  box.style.borderRadius = '12px';
  box.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
  box.style.zIndex = '10000';
  box.style.cursor = 'pointer';
  box.style.fontSize = '14px';
  box.style.color = '#333';
  box.style.textAlign = 'center';
  box.innerHTML = `المنقح: <span style="color: #1DA1F2; font-weight: bold;">${suggestionText}</span>`;

  // Click event to apply the suggestion
  box.addEventListener('click', () => {
    console.log("Suggestion clicked. Replacing text.");
    replaceTextInElement(suggestionText, element);
    removeSuggestionBox();
  });

  document.body.appendChild(box);
}

// Function to replace the full text in the element with the suggested text
function replaceTextInElement(suggestionText, element) {
  if (element.isContentEditable) {
    element.innerText = suggestionText;
  } else {
    element.value = suggestionText;
  }

  // Set focus back on the element and position cursor at the end
  element.focus();
  if (!element.isContentEditable) {
    element.setSelectionRange(suggestionText.length, suggestionText.length);
  } else {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// Remove the "Did you mean" suggestion box
function removeSuggestionBox() {
  const existingBox = document.getElementById('suggestion-box');
  if (existingBox) existingBox.remove();
}

// Monitor the editable element for input changes and trigger grammar checking
function monitorEditableElement(element) {
  element.addEventListener('input', () => {
    console.log("Detected input in editable element.");
    clearTimeout(typingTimer);

    // Debounce grammar checking to wait until user stops typing
    typingTimer = setTimeout(() => {
      const userText = element.isContentEditable ? element.innerText : element.value;
      console.log("Checking grammar for text:", userText);
      showSuggestionBox(userText, element);
    }, typingDelay);
  });
}

// Function to initialize monitoring for all editable areas
function initGrammarCheck() {
  document.querySelectorAll('[contenteditable="true"], textarea').forEach((element) => {
    monitorEditableElement(element);
  });

  // Observe the DOM for dynamically added editable elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && (node.matches('[contenteditable="true"]') || node.tagName === 'TEXTAREA')) {
          monitorEditableElement(node);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Initialize grammar checking when page is fully loaded
initGrammarCheck();


