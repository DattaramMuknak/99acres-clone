// For cache bursting change version number only, no need to rename sw.js file
// Only right ES5 code in this file

var version = 'v10';
var abValue = 0;
var hitTracking = false;

self.addEventListener('install', function() {
    console.log(version + ' service worker version is insatlling...');
    //self.skipWaiting() prevents the waiting, meaning the service worker activates as soon as it's finished installing.
    //This means some of your page's fetches will have been handled by your old service worker,
    // but your new service worker will be handling subsequent fetches.
    //If this might break things, don't use skipWaiting().
    self.skipWaiting();
});

self.addEventListener('activate', function() {
    console.log(version + ' service worker version now ready to handle fetches!');
    //You can take control of uncontrolled clients by calling clients.claim()
    // within your service worker once it's activated.
    self.clients.claim();
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'cookieValue') {
        abValue = event.data.value;
        console.log('Cookie value received in service worker:', abValue);
        // You can do further processing with the cookie value here
    }
});

// function postClickStream(trackingObject){
//   const clickStreamUrl = `https://www.99acres.com/do/clickStreamTracking/ClickStream/trackData`;
//   fetch(clickStreamUrl, {
//       method: 'POST',
//       credentials: 'same-origin',
//       headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: 'trackingData[]=' + encodeURIComponent(JSON.stringify(trackingObject)),
//   })
//   .then((response) => { });
// }

self.addEventListener('push', function(event) {
    var dataFromPush = JSON.parse(event.data.text());
    const title = dataFromPush.title;
    var actions = dataFromPush.actions ? JSON.parse(dataFromPush.actions) : [];
    var data = dataFromPush.data ? JSON.parse(dataFromPush.data) : {};
    const options = {
        body: dataFromPush.body,
        data: {
            url: data.url,
            actions: actions,
            nwsUrl: dataFromPush.nwsUrl
        },
        icon: dataFromPush.icon,
        image: dataFromPush.image,
        badge: dataFromPush.badge,
        actions: actions,

        requireInteraction: dataFromPush.requireInteraction,
    };
    event.waitUntil(self.registration.showNotification(title, options));
    var receivedNotificationUrl =
        dataFromPush.nwsUrl + '&status=UNREAD&receivedAt=' + new Date().getTime();
    fetch(receivedNotificationUrl);
});

self.addEventListener('notificationclick', function(event) {
    var redirectUrl = '';
    if (event.action) {
        var index = event.notification.data.actions.findIndex(function(actionItem) {
            return actionItem.action == event.action;
        });
        redirectUrl = event.notification.data.actions[index].link;
    } else {
        redirectUrl = event.notification.data.url;
    }
    event.notification.close();
    event.waitUntil(clients.openWindow(redirectUrl));
    var openedNotificationUrl =
        event.notification.data.nwsUrl + '&status=READ&openedAt=' + new Date().getTime();
    fetch(openedNotificationUrl);
});

function allowAvifFeature(event) {
    if (event ? .request ? .url ? .toLowerCase() ? .includes("universalapp") || event ? .request ? .url ? .toLowerCase() ? .includes("universalpd") || event ? .request ? .url ? .toLowerCase() ? .includes("universalrei")) {
        return true;
    }
    return false;
    // if (abValue >= 1 && abValue <= 50) {
    //   return true; 
    // }
    // return false;

}

self.addEventListener('fetch', function(event) {
    // if(/\.jpg$|.jpeg$|.png$|.webp$/.test(event.request.url) && isAvifSupportedNew(event?.request?.headers) && !hitTracking){
    //   hitTracking = true;
    //   let trackingObject = {
    //     'action': {
    //       'page': "AVIF_IMAGES",
    //       'stage': "FINAL",
    //       'event': 'SECTION_VIEW',
    //       'section': 'AVIF_SUPPORTED'
    //     }
    //   }
    //   postClickStream(trackingObject)
    // }
    // else if(/\.jpg$|.jpeg$|.png$|.webp$/.test(event.request.url) && !hitTracking) {
    //   hitTracking = true;
    //   let trackingObject = {
    //     'action': {
    //       'page': "AVIF_IMAGES",
    //       'stage': "FINAL",
    //       'event': 'SECTION_VIEW',
    //       'section': 'AVIF_NOT_SUPPORTED'
    //     }
    //   }
    //   postClickStream(trackingObject)
    // }
    if (/\.jpg$|.jpeg$|.png$|.webp$/.test(event.request.url) && isAvifSupportedNew(event ? .request ? .headers) && allowAvifFeature(event)) {
        return handleAvifImages(event);
    }

    // Handle images
    else if (/\.jpg$|.jpeg$|.png$/.test(event.request.url)) {
        return handlePropertyImages(event);
    }
});

var isWebpSupported = (function() {
    var isSupported;
    return function(headers) {
        if (typeof isSupported !== 'undefined') {
            return isSupported;
        } else {
            isSupported = headers.has('accept') && headers.get('accept').includes('webp');
            return isSupported;
        }
    };
})();
var isAvifSupportedNew = (function() {
    var isAvif;
    return function(headers) {
        if (typeof isAvif !== 'undefined') {
            return isAvif;
        } else {
            isAvif = headers.has('accept') && headers.get('accept').includes('avif');
            return isAvif;
        }
    };
})();

// Environment wise response
var getMediaServiceUrls = (function() {
    //Cache response

    let response;

    return function() {

        if (typeof response !== 'undefined') {
            return response;
        }

        let propertyImagesDomain;
        let projectImagesDomains;
        let s3ImagesDomains;

        if (location.hostname === 'www.99acres.com') {
            //live and staging urls
            propertyImagesDomain = {
                current: 'mediacdn.99acres.com',
                new: 'imagecdn.99acres.com',
            };

            projectImagesDomains = {
                current: 'newprojects.99acres.com',
                new: 'imagecdn.99acres.com',
            };

            s3ImagesDomains = {
                current: 'imagecdn.99acres.com',
                new: 'imagecdn.99acres.com',
            };
        } else {
            // sanity urls
            propertyImagesDomain = {
                current: 'cloud-99.infoedge.com',
                new: 'aws-99.infoedge.com',
            };

            projectImagesDomains = {
                current: '99sanityacd.infoedge.com',
                new: 'aws-99.infoedge.com',
            };

            s3ImagesDomains = {
                current: 'aws-99.infoedge.com',
                new: 'aws-99.infoedge.com',
            };
        }

        response = {
            propertyImagesDomain,
            projectImagesDomains,
            s3ImagesDomains,
        };

        return response;
    }

})();

async function handleAvifImages(event) {
    var request = event.request;
    var isProperty = false;
    let {
        propertyImagesDomain,
        projectImagesDomains
    } = getMediaServiceUrls();
    if (propertyImagesDomain.current.indexOf(new URL(request.url).hostname) >= 0) {
        isProperty = true;
    } else if (projectImagesDomains.current.indexOf(new URL(request.url).hostname) >= 0) {
        isProperty = true;
    }
    if (isAvifSupportedNew(request.headers) && !isProperty && allowAvifFeature(event)) {
        var avifUrl = request ? .url ? .substr(0, request.url.lastIndexOf('.')) + '.avif'
        var avifReq = new Request(avifUrl, request)
        event.respondWith(
            fetch(avifReq, {
                // ...request,
                mode: 'cors', // For opaque response, and cross browser
                credentials: 'omit',
                //  // Response Accept header '*'can't be used as cors request x
            })
            .then(newresponse => {
                //status 200 or 304
                if (newresponse ? .ok || newresponse ? .status === 304) {
                    // webp image
                    return newresponse;
                }

                //Fallback,
                throw new Error('avif image not present through SW - ' + avifUrl);
            })
            .catch(err => {
                //Any network error or unsuccessfull response
                console.warn(err);
                // FALLBACK, Fetch original request
                return fetch(request, {
                    // mode: 'cors',
                    // credentials: 'omit',
                });
            })
        );
    } else if (isProperty) {
        handlePropertyImages(event)
    }
    return;
}


function handlePropertyImages(event) {
    var request = event.request;
    // Is WebpSupported on browser
    if (isWebpSupported(request.headers)) {
        var newRequestUrl;

        let {
            propertyImagesDomain,
            projectImagesDomains,
            s3ImagesDomains
        } = getMediaServiceUrls();

        // Replace extenxtion to .webp
        newRequestUrl = request.url.substr(0, request.url.lastIndexOf('.')) + '.webp';
        // Check is property images
        if (request ? .url ? .includes("microsite/wp-content/blogs.dir")) {
            return;
        } else if (propertyImagesDomain.current.indexOf(new URL(request.url).hostname) >= 0) {
            newRequestUrl = newRequestUrl.replace(propertyImagesDomain.current, propertyImagesDomain.new);
        } else if (projectImagesDomains.current.indexOf(new URL(request.url).hostname) >= 0) {
            // Check for project images
            newRequestUrl = newRequestUrl.replace(projectImagesDomains.current, projectImagesDomains.new);
        } else if (s3ImagesDomains.current.indexOf(new URL(request.url).hostname) >= 0) {
            // Check for s3 images
            newRequestUrl = newRequestUrl.replace(s3ImagesDomains.current, s3ImagesDomains.new);
        } else {
            // Don't handle other urls
            return;
        }

        event.respondWith(
            fetch(newRequestUrl, {
                ...request,
                mode: 'cors', // For opaque response, and cross browser
                credentials: 'omit', // Response Accept header '*'can't be used as cors request x
            })
            .then(response => {
                //status 200 or 304
                if (response.ok || response.status === 304) {
                    // webp image
                    return response;
                }

                //Fallback,
                throw new Error('webp image not present through SW - ' + newRequestUrl);
            })
            .catch(err => {
                //Any network error or unsuccessfull response
                console.warn(err);
                // FALLBACK, Fetch original request
                return fetch(request, {
                    mode: 'cors',
                    credentials: 'omit',
                });
            })
        );
    }
    return;
}