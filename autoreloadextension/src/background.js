
chrome.experimental.processes.onUpdated.addListener(function(process) {
});

chrome.experimental.processes.onExited.addListener(function(processId, exitType, integerexitCode) {
    console.log("exited", processId, exitType);
    if (exitType === 2) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.reload();
        });
    }
});

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.experimental.processes.getProcessIdForTab(tab.id, function(processId) {
        chrome.experimental.processes.terminate(processId);
    });
});


//chrome.commands.onCommand.addListener(function(command) {
//    console.log('Command:', command);
//});
//chrome.commands.onCommand.addListener(function(command) {
//    if (command == "toggle-pin") {
//        // Get the currently selected tab
//        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//            // Toggle the pinned status
//            var current = tabs[0]
//            chrome.tabs.update(current.id, {'pinned': !current.pinned});
//        });
//    }
//});

//chrome.commands.onCommand.addListener(function(command) {
//    if (command == "crash") {
//        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { // Get the currently selected tab
//            var current = tabs[0]
//            chrome.experimental.processes.getProcessIdForTab(current.id, function(processId) {
//                chrome.experimental.processes.terminate(processId);
//            });
//        });
//    }
//});

//function openNextPage(currentWindowID) {
//    console.log("in openNextPage");
//
//    chrome.tabs.create({url: "test2.html"},
//    function(tab) {
//        chrome.tabs.sendRequest(tab.id, {someParam: currentWindowID})
//    });
//    console.log("exiting openNextPage");
//}

// Called when the user clicks on the browser action.
//chrome.browserAction.onClicked.addListener(function(tab) {
//    // No tabs or host permissions needed!
//    console.log('Turning ' + tab.url + ' red!');
//    chrome.tabs.executeScript({
//        code: 'document.window.reload()'
//    });
//});
//chrome.browserAction.onClicked.addListener(function(tab) {
//
//    chrome.experimental.processes.getProcessIdForTab(tab.id, function(processId) {
//        chrome.experimental.processes.terminate(processId);
//    });
//
//    return;
//    chrome.tabs.query({
//        active: true
//    }, function(result) {
//        var i;
//        for (i = 0; i < result.length; i += 1) {
//        }
//    });
//
//    return;
//    console.log('Turning ' + tab.url + ' red!');
//    chrome.tabs.reload();
//    return;
//    chrome.tabs.getSelected(null, function(tab) {
//        var myTabUrl = tab.url;
//    });
//
//    return;
//    chrome.windows.getCurrent(function(window) {
//        window.location.reload(true);
//        // then get the current active tab in that window
//        chrome.tabs.query({
//            active: true,
//            windowId: window.id
//        }, function(tabs) {
//            var tab = tabs[0];
//            document.write(tab.url)
//        });
//    });
//
//    return;
//
//    chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
//
//        var activeTab = arrayOfTabs[0];
//
//        activeTab.executeScript({
//            code: 'document.body.style.backgroundColor="red"'
//        });
//
//    });
//
//});
//console.log("loaded");