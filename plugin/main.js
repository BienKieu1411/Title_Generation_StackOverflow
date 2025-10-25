(function () {
  const API_BASE_URL = 'http://127.0.0.1:8000';

  function showToast(message, options = {}) {
    const duration = options.duration || 4000;
    const containerId = 'tg_toast_container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'fixed';
      container.style.right = '20px';
      container.style.bottom = '20px';
      container.style.zIndex = '10000';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '8px';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.background = 'rgba(0,0,0,0.85)';
    toast.style.color = 'white';
    toast.style.padding = '10px 14px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
    toast.style.fontSize = '13px';
    toast.style.maxWidth = '320px';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 200ms ease, transform 200ms ease';
    toast.style.transform = 'translateY(6px)';
    toast.style.cursor = 'pointer';

    container.appendChild(toast);
    void toast.offsetWidth;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    let hideTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
        if (container && container.children.length === 0 && container.parentNode) container.parentNode.removeChild(container);
      }, 220);
    }, duration);

    toast.addEventListener('click', () => {
      clearTimeout(hideTimeout);
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      if (container && container.children.length === 0 && container.parentNode) container.parentNode.removeChild(container);
    });

    return toast;
  }
  function createTitleSuggestionPanel(description, code, tag, targetInputId = 'title') {
    console.log('createTitleSuggestionPanel called with:', {description: description.substring(0, 50) + '...', code: code.substring(0, 50) + '...', tag, targetInputId});
    let suggestionPanel = document.getElementById('title_suggestion_panel');
    if (!suggestionPanel) {
      console.log('Creating new suggestion panel');
      suggestionPanel = document.createElement('div');
      suggestionPanel.id = 'title_suggestion_panel';
      suggestionPanel.style.position = 'fixed';
      suggestionPanel.style.bottom = '20px';
      suggestionPanel.style.right = '20px';
      suggestionPanel.style.width = '380px';
      suggestionPanel.style.maxHeight = '500px';
      suggestionPanel.style.overflowY = 'auto';
      suggestionPanel.style.backgroundColor = '#ffffff';
      suggestionPanel.style.border = '1px solid #d6d9dc';
      suggestionPanel.style.borderRadius = '8px';
      suggestionPanel.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15), 0 2px 10px rgba(0,0,0,0.1)';
      suggestionPanel.style.zIndex = '9999';
      suggestionPanel.style.padding = '0';
      suggestionPanel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      suggestionPanel.style.fontSize = '14px';
      suggestionPanel.style.cursor = 'move';
      suggestionPanel.style.overflow = 'hidden';
      document.body.appendChild(suggestionPanel);
      makeDraggable(suggestionPanel);
    }
    
    suggestionPanel.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #0074cc, #0a95ff);
        color: white;
        padding: 16px 20px;
        font-weight: 600;
        font-size: 15px;
        border-radius: 8px 8px 0 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <span>Title Suggestions</span>
        <div style="
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
      </div>
      <div style="
        padding: 20px;
        text-align: center;
        color: #6a737c;
        font-size: 14px;
        background: #f8f9fa;
      ">
        <div style="margin-bottom: 8px;">Generating titles...</div>
        <div style="font-size: 12px; opacity: 0.8;">This may take a few seconds</div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    suggestionPanel.style.display = 'block';

    const requestData = {
      description: description,
      code: code,
      tag: tag
    };

    const apiUrl = `${API_BASE_URL}/genTitle?v=${Date.now()}`;
    
    console.log('Making POST request to:', apiUrl);
    console.log('Request data:', requestData);

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Response received:', data);
        if (data && data.title_list && Array.isArray(data.title_list)) {
          console.log('Title list:', data.title_list);
          const uniqueTitles = removeDuplicateTitles(data.title_list);
          console.log('Unique titles:', uniqueTitles);
          displayTitleSuggestions('title_suggestion_panel', targetInputId, uniqueTitles);
        } else {
          console.error('Invalid response format:', data);
          try {
            showToast('Error: Invalid response from the title generation service.');
          } catch (e) {
            console.error('showToast failed:', e);
          }
          suggestionPanel.style.display = 'none';
        }
      })
      .catch((error) => {
        try {
          showToast('Error connecting to the title generation service. Title suggestions are unavailable.');
        } catch (e) {
          console.error('showToast failed:', e);
        }
        suggestionPanel.style.display = 'none';
      });
  }

  function removeDuplicateTitles(titles) {
    const seen = new Set();
    const uniqueTitles = [];
    
    for (const title of titles) {
      const normalizedTitle = title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!seen.has(normalizedTitle)) {
        seen.add(normalizedTitle);
        uniqueTitles.push(title);
      }
    }
    
    return uniqueTitles;
  }

  function displayTitleSuggestions(containerId, targetInputId, titleList) {
    console.log('displayTitleSuggestions called with:', {containerId, targetInputId, titleList});
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }
    console.log('Container found:', container);

    container.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #0074cc, #0a95ff);
        color: white;
        padding: 16px 20px;
        font-weight: 600;
        font-size: 15px;
        border-radius: 8px 8px 0 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
      ">
        <span>Title Suggestions (${titleList.length})</span>
        <button onclick="document.getElementById('title_suggestion_panel').style.display='none'" style="
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        " onmouseover="this.style.backgroundColor='rgba(255,255,255,0.2)'" onmouseout="this.style.backgroundColor='transparent'">×</button>
      </div>
      <div style="
        max-height: 400px;
        overflow-y: auto;
        background: #ffffff;
      ">
    `;

    titleList.forEach(function (title, index) {
      const suggestionItem = document.createElement('div');
      suggestionItem.id = `suggestion_${index}`;
      suggestionItem.className = 'title-suggestion-item';
      suggestionItem.textContent = title;
      
      suggestionItem.style.padding = '16px 20px';
      suggestionItem.style.cursor = 'pointer';
      suggestionItem.style.borderBottom = '1px solid #f1f2f3';
      suggestionItem.style.fontSize = '14px';
      suggestionItem.style.lineHeight = '1.4';
      suggestionItem.style.color = '#232629';
      suggestionItem.style.transition = 'all 0.2s ease';
      suggestionItem.style.position = 'relative';

      suggestionItem.addEventListener('mouseover', function () {
        this.style.backgroundColor = '#f1f2f3';
        this.style.borderLeft = '4px solid #0074cc';
        this.style.paddingLeft = '16px';
      });
      suggestionItem.addEventListener('mouseout', function () {
        this.style.backgroundColor = 'white';
        this.style.borderLeft = 'none';
        this.style.paddingLeft = '20px';
      });
      suggestionItem.addEventListener('click', function () {
        container.style.display = 'none';
        const selectedTitle = this.textContent;

        const titleSelectors = [
          '#post-title-input',
          '#title',
          'input[name="title"]',
          'input[placeholder*="title" i]',
          '.s-input[name="title"]'
        ];

        let titleInput = null;
        for (const selector of titleSelectors) {
          titleInput = document.querySelector(selector);
          if (titleInput) break;
        }

        if (titleInput) {
          titleInput.focus();
          titleInput.value = selectedTitle;

          titleInput.dispatchEvent(new Event('input', { bubbles: true }));
          titleInput.dispatchEvent(new Event('change', { bubbles: true }));
          titleInput.dispatchEvent(new Event('blur', { bubbles: true }));

          setTimeout(() => {
            titleInput.focus();
          }, 100);
        } else {
          try {
            showToast('Could not find title input field. Please make sure you are on the Stack Overflow ask page.');
          } catch (e) {
            console.error('showToast failed:', e);
          }
        }
      });

      container.querySelector('div:last-child').appendChild(suggestionItem);
    });
    
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 12px 20px;
      background: #f8f9fa;
      border-top: 1px solid #e1e5e9;
      font-size: 12px;
      color: #6a737c;
      text-align: center;
      border-radius: 0 0 8px 8px;
    `;
    footer.innerHTML = 'Click any title to use it';
    container.appendChild(footer);
    
    container.style.display = 'block';
  }

  function makeDraggable(element) {
    if (!element) return;

    let startX, startY, currentX, currentY;

    element.onmousedown = function (event) {
      if (event.target !== element && event.target.parentNode !== element) {
         return;
      }
      
      event.preventDefault();
      startX = event.clientX;
      startY = event.clientY;
      
      let initialRight = element.style.right;
      let initialBottom = element.style.bottom;
      
      if (!initialRight || initialRight === 'auto') {
        initialRight = (window.innerWidth - (element.offsetLeft + element.offsetWidth)) + 'px';
      }
      if (!initialBottom || initialBottom === 'auto') {
        initialBottom = (window.innerHeight - (element.offsetTop + element.offsetHeight)) + 'px';
      }
      
      element.style.right = initialRight;
      element.style.bottom = initialBottom;


      document.onmousemove = function (event) {
        event.preventDefault();
        currentX = event.clientX;
        currentY = event.clientY;
        
        let newRight = parseInt(element.style.right) - (currentX - startX);
        let newBottom = parseInt(element.style.bottom) - (currentY - startY);

        element.style.right = newRight + 'px';
        element.style.bottom = newBottom + 'px';

        startX = currentX;
        startY = currentY;
      };

      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  }

  document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 'q') {
      event.preventDefault();
      event.stopPropagation();
      
      const bodySelectors = [
        '.ProseMirror',
        'div[contenteditable="true"]',
        '#wmd-input',
        '.js-editor',
        'textarea[name="not-an-edit"]',
        '.s-prose textarea',
        'textarea[data-min-length]',
        'textarea[placeholder*="body" i]',
        'textarea[placeholder*="question" i]',
        '.wmd-input',
        'textarea'
      ];

      const titleSelectors = [
        '#post-title-input',
        '#title',
        'input[name="title"]',
        'input[placeholder*="title" i]',
        '.s-input[name="title"]'
      ];

      const tagSelectors = [
        '#filterInput',
        '#tagnames',
        'input[name="tagnames"]',
        'input[placeholder*="tag" i]',
        '.s-input[name="tagnames"]'
      ];

      let attempts = 0;
      const maxAttempts = 10;

      function normalizeTag(tag) {
        const map = {
          "pythonDismiss tag": "Python",
          "javaDismiss tag": "Java",
          "c#Dismiss tag": "C#",
          "javascriptDismiss tag": "JS"
        };
      
        return map[tag] || tag;  
      }

      function findAndProcess() {
        let bodyElement = null;
        for (const selector of bodySelectors) {
          bodyElement = document.querySelector(selector);
          if (bodyElement) break;
        }
      
        if (bodyElement) {
          let body = '';
          if (bodyElement.contentEditable === 'true') {
            body = bodyElement.innerText || bodyElement.textContent || '';
          } else {
            body = bodyElement.value || '';
          }
        
          if (!body || !body.trim()) {
            try { showToast('No body content found. Please type your question first.'); } 
            catch (e) { console.error('showToast failed:', e); }
            return;
          }
        
          let description = '';
          let code = '';
          let tag = '';
        
          let titleInput = null;
          for (const selector of titleSelectors) {
            titleInput = document.querySelector(selector);
            if (titleInput) break;
          }
        
          let addedTags = document.querySelectorAll('.s-tag');
          if (addedTags.length > 0) {
            let tagNames = [];
            addedTags.forEach(t => tagNames.push(t.textContent));
            tag = tagNames.join(',');
          } else {
            let tagElement = null;
            for (const selector of tagSelectors) {
              tagElement = document.querySelector(selector);
              if (tagElement && tagElement.value) {
                tag = tagElement.value;
                break;
              }
            }
          }

          tag = normalizeTag(tag.trim());

          const codeBlockMatches = body.match(/```[\s\S]*?```/g) || [];
          const inlineCodeMatches = [];
          const inlineRegex = /`([\s\S]*?)`/g;
          let m;
          while ((m = inlineRegex.exec(body)) !== null) {
            inlineCodeMatches.push(m[1]);
          }
        
          let allCode = [];
          if (codeBlockMatches.length > 0) allCode = allCode.concat(codeBlockMatches);
          if (inlineCodeMatches.length > 0) allCode = allCode.concat(inlineCodeMatches);
          if (allCode.length > 0) code = allCode.join('\n\n');
        
          description = body;
          codeBlockMatches.forEach(block => {
            description = description.replace(block, '');
          });
          description = description.replace(/`[\s\S]*?`/g, '');
          description = description.replace(/\n\s*\n/g, '\n').trim();
        
          const targetInputId = titleInput ? titleInput.id || 'title' : 'title';
          createTitleSuggestionPanel(description, code, tag, targetInputId);
        
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(findAndProcess, 300);
        } else {
          try { showToast('Could not find the text editor. Please make sure the page is fully loaded.'); } 
          catch (e) { console.error('showToast failed:', e); }
        }
      }

      findAndProcess();
    }
  });

})();
