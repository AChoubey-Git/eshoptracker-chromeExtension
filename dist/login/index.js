
let islogin = false;
// sign in operation
function getValue(id) {
    return document.getElementById(id)
}

function login() {
    const email = getValue('email').value;
    const password = getValue('password').value;
    if (email && password) {
        chrome.runtime.sendMessage({ message: 'login', payload: { email, password } })
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await isSignIn();
    console.log(islogin);
    if (!islogin) {
        const loginform = document.querySelector('form');
        const signup = document.getElementById('signup');
        if (loginform) {
            loginform.addEventListener('submit', (event) => {
                event.preventDefault();
                login()
                // location.replace('../popup.html')
            })
        }
        if (signup) {
            signup.addEventListener('click', () => {
                location.replace('../sign_up/signup.html')
            })
        }
    } else {
        location.replace('../popup.html')
    }


})

//
chrome.runtime.onMessage.addListener((request, sender) => {
    if (request.message === "login") {
        if (request.data.status) {
            location.replace('../popup.html')
        } else {
            const status = document.getElementById('status');
            status.innerText = request.data.message
            document.querySelector('form').reset()
        }

    }
})

async function isSignIn() {
    const user = await chrome.storage.sync.get("name");
    const access = await chrome.storage.sync.get("token");
    islogin = user.name && access.token;
}

async function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}





