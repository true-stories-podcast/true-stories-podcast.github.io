(function() {
  let activeIframe = null;
  let allIframes = []; // Keep a live list of all iframes

  // Function to find and register iframes within a given element
  function discoverIframes(rootElement) {
    // Check the root element itself if it's a matching iframe
    if (rootElement.matches && rootElement.matches('iframe[src*="open.spotify.com/embed"]')) {
      if (!allIframes.includes(rootElement)) {
        allIframes.push(rootElement);
      }
    }
    // Then check its children
    const newIframes = rootElement.querySelectorAll('iframe[src*="open.spotify.com/embed"]');
    newIframes.forEach(iframe => {
      if (!allIframes.includes(iframe)) {
        allIframes.push(iframe);
      }
    });
  }

  // Central event listener on the window
  window.addEventListener('message', event => {
    if (event.origin !== 'https://open.spotify.com' || !event.data) {
      return;
    }

    const data = event.data;
    if (data.type === 'playback_update' && data.payload && typeof data.payload.isPaused !== 'undefined') {
      if (data.payload.isPaused === false) { // Player is playing
        const sourceIframe = allIframes.find(iframe => iframe.contentWindow === event.source);

        if (sourceIframe) {
          if (activeIframe && activeIframe !== sourceIframe) {
            activeIframe.contentWindow.postMessage({ command: 'toggle' }, 'https://open.spotify.com');
          }
          activeIframe = sourceIframe;
        }
      }
    }
  });

  // --- MutationObserver to handle dynamically added iframes ---
  const observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            discoverIframes(node);
          }
        });
      }
    }
  });

  // Initial discovery run for elements present on page load
  discoverIframes(document.body);

  // Start observing the document body for additions of new elements
  observer.observe(document.body, { childList: true, subtree: true });

})();