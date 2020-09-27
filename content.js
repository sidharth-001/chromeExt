chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get_images"){
        var imgs = document.getElementsByTagName("img");
        var formatted_images = [];
        for (let i = 0; i < imgs.length; i++){
            formatted_images.push(imgs[i].src);
        }
        sendResponse(formatted_images);
    }
});