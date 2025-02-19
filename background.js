chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
      id: "copyOfficialURL",
      title: "Copy Official URL",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "copyOfficialURL" && info.selectionText) {
      var query = info.selectionText.trim();
      var googleLuckyUrl = "https://www.google.com/search?q=" + encodeURIComponent(query) + "&btnI=I&hl=en";
      // Open the "I'm Feeling Lucky" URL in a background tab
      chrome.tabs.create({ url: googleLuckyUrl, active: false }, function(newTab) {
        function handleUpdated(tabId, changeInfo, updatedTab) {
          if (tabId === newTab.id && changeInfo.status === "complete") {
            // When the tab has finished loading and its URL is not a Google URL, assume redirection worked
            if (updatedTab.url.indexOf("google.com") === -1) {
              chrome.tabs.onUpdated.removeListener(handleUpdated);
              // Copy using the background page's DOM (which is active and can execute copy)
              copyToClipboard(updatedTab.url);
              chrome.notifications.create({
                type: "basic",
                iconUrl: "icon48.png",
                title: "URL Copied",
                message: "Copied URL: " + updatedTab.url
              });
              // Close the temporary tab
              chrome.tabs.remove(tabId);
            }
          }
        }
        chrome.tabs.onUpdated.addListener(handleUpdated);
      });
    }
  });
  
  function copyToClipboard(text) {
    // Create a temporary textarea element in the background page's document
    var textarea = document.createElement("textarea");
    textarea.value = text;
    // Optional: keep it off-screen
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      console.log("Copied to clipboard: " + text);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
    document.body.removeChild(textarea);
  }
  