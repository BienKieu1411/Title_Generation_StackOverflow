document.addEventListener('DOMContentLoaded', function() {
    const statusIndicator = document.getElementById('status-indicator');
    const testConnectionBtn = document.getElementById('test-connection-btn');
    
    testConnectionBtn.addEventListener('click', function() {
        testBackendConnection();
    });
    
    function testBackendConnection() {
        updateStatus('Testing connection...', 'loading');
        
        const requestData = {
            description: 'test',
            code: 'test',
            tag: 'test'
        };
        
        fetch(`http://127.0.0.1:8000/genTitle?v=${Date.now()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
            .then(response => {
                if (response.ok) {
                    updateStatus('Backend connected successfully!', 'success');
                } else {
                    updateStatus('Backend responded with error', 'error');
                }
            })
            .catch(error => {
                updateStatus('Cannot connect to backend. Make sure the server is running.', 'error');
                console.error('Connection error:', error);
            });
    }
    
    function updateStatus(message, type) {
        const statusText = statusIndicator.querySelector('.status-text');
        statusText.textContent = message;
        
        statusIndicator.classList.remove('success', 'error', 'loading');
        
        if (type) {
            statusIndicator.classList.add(type);
        }
    }
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentUrl = tabs[0].url;
        if (currentUrl.includes('stackoverflow.com')) {
            updateStatus('Ready to generate titles on Stack Overflow', 'success');
        } else {
            updateStatus('Please navigate to Stack Overflow to use this extension', 'warning');
        }
    });
});
