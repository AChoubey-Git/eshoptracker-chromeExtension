
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

async function signup(payload: any): Promise<any> {
    return fetch(`https://amitav.ngrok.io/user/signup`,
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
    return fetch('https://amitav.ngrok.io/user/login',
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
                    chrome.storage.sync.set({name: data.username});
                    chrome.storage.sync.set({token: data.token});
                }
                resolve(data);
                
            });
        })
    })
        .catch((error) => {
            console.log(error);

        })
}
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const message = request.message;
    if (message === 'login') {
        const res = await login(request.payload);
        if (res) {
            chrome.runtime.sendMessage({ message: "login", data: res });
        }
        sendResponse("success");
    } else if (message === 'logout') {
        // remove session
    } else if (message === 'signup') {
        const res = await signup(request.payload)
        if (res) {
            chrome.runtime.sendMessage({ message: "signup", data: res });
        }
        sendResponse("success");
    }
})

