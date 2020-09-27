var images = [];
var imageNum = 0;

chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "get_images"}, response => {
        $('.gallery').html('');
        images = response;
        response.map((img) => {
            if(img) imageNum++;
        });
        $('.gallery').append('<h3>Number of images: '+ imageNum +'</h3>');
        response.map((img) => {
            var image = new Image();
            image.src = img;
            document.body.appendChild(image);
        });
    });
});


$(document).on('click', '#download_all', (e) => {
    let i=0;
    setInterval(function(){
        if(images[i]){
            var link = document.createElement("a");
            link.id=i;
            link.download = "images.png";
            link.href = images[i];
            link.click();
            i++;
        }
    },100);
});