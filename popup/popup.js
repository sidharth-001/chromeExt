var images = [];
var imgNum;

chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "get_images"}, response => {
        images = response;
        imgNum = 0;
        if(!images){
            $('.gallery').append('<h3>No images were found on this page :(</h3>');
        }else{
            $('.gallery').html('');
            response.map((img) => {
                if(img) imgNum++;
            });
            $('.gallery').append('<h3>Number of images: '+ imgNum +'</h3>');
            response.map((img) => {
                if(img){
                    var image = new Image();
                    image.src = img;
                    image.addEventListener('error', () => {
                        console.log("Err: Error loading the following source <"+img+'>');
                        image.src = '../resources/badImage.jpg';
                    });
                    document.body.appendChild(image);
                }
            });
        }
    });
});

//The below code will download all images (unzipped)\
/* 
$(document).on('click', '#download_all', (e) => {
    let i=0;
    setInterval(function(){
        if(/^data:image/.test(images[i]))  console.log("base64");
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
*/

function generateZIP() {
    let l=0;
    var zip = new JSZip();
    var zipFilename = "Pictures.zip";

    var i=0;
    while(images[i]){
        var myData = "";
        var filename = 'image_'+i+'.png';

        if(/^data:image/.test(images[i])){
            let temp = images[i].split(',');
            myData = temp[1];
            zip.file(filename, myData, { base64: true });
        }else{
            let rejection = false;
            function urlToPromise(url) {
                return new Promise(function(resolve, reject) {
                    JSZipUtils.getBinaryContent(url, function (err, data) {
                        if(err){
                            rejection = true;
                            reject(err);
                        }else{
                            resolve(data);
                        }
                    });
                });
            }
            if(!rejection) zip.file(filename, urlToPromise(images[i]), {binary:true});
        }
        i++;
    }
    zip.generateAsync({ type: 'blob' }).then(function (content) {
        saveAs(content, zipFilename);
    });
}

$(document).on('click', '#download_all', (e) => {
    generateZIP();
});