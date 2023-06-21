
// chrome.tabs.query({active:true,currentWindow:true},([tab])=>{
// console.log(tab);
// })
// chrome.tabs.onUpdated.addListener((tabId, tab) => {
//     if (tab.url && tab.url.includes("amazon.in")) {
//         console.log(tab.url);
//         const productId = tab.url.split("/")[5];
//         console.log(productId);
//         chrome.tabs.sendMessage(tabId, {
//             type: "NEW",
//             value: tab,
//             url: tab.url,
//             productId
//         },(response)=>{
//             console.log(response);
//         })
//     }
// })

let db = null;
// function create_database() {
//     const request = indexedDB.open('activity');

//     request.onerror = (event) => {
//         console.log("Problem opening DB.");
//     }

//     request.onupgradeneeded = (event: any) => {
//         db = event.target.result;
//         let objectStore = db.createObjectStore('products', {
//             keyPath: ['id','userId']
//         });

//         objectStore.transaction.oncomplete = (event: any) => {
//             console.log("ObjectStore Created.");
//         }
//     }

//     request.onsuccess = (event: any) => {
//         db = event.target.result;
//         console.log("DB OPENED.");
//     }
// }
async function signup(payload: any): Promise<any> {
    return fetch(`http://eshop-activity-log.pearlthoughts.com/user/signup`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(payload)
        },
    ).then((res) => {
        return new Promise(async (resolve) => {
            await res.json().then((data) => resolve(data));
        })
    })
        .catch((error) => {
            console.log(error);

        })
}

async function login(payload: any): Promise<any> {
    return fetch('http://eshop-activity-log.pearlthoughts.com/user/login',
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(payload)
        },
    ).then((res) => {
        return new Promise(async (resolve) => {
            await res.json().then((data) => {
                // store in session
                if (data.status) {
                    chrome.storage.sync.set({ name: data.username });
                    chrome.storage.sync.set({ token: data.token });
                }
                resolve(data);

            });
        })
    })
        .catch((error) => {
            console.log(error);

        })
}
// create_database()
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const message = request.message;
    if (message === 'login') {
        const req = await login(request.payload);
        if (req) {
            chrome.runtime.sendMessage({ message: "login", data: req });
        }
        sendResponse("success");
    } else if (message === 'logout') {
        // remove session
    } else if (message === 'signup') {
        const data = await signup(request.payload)
        if (data) {
            chrome.runtime.sendMessage({ message: "signup", data });
        }
        sendResponse("success");
    } else if (message === "history") {

    }

})

